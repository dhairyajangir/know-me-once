#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { extractProfileForHarness, normalizeExternalUrl } = require("../server");

const DEFAULT_CORPUS_PATH = path.join(__dirname, "corpus", "labeled-samples.json");
const DEFAULT_REPORT_PATH = path.join(process.cwd(), ".reports", "accuracy-report.json");

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const corpusPath = path.resolve(options.corpus || DEFAULT_CORPUS_PATH);
  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));

  if (!Array.isArray(corpus) || corpus.length === 0) {
    throw new Error("Corpus is empty or invalid. Expected an array of labeled samples.");
  }

  const fields = options.fields && options.fields.length ? options.fields : deriveFieldSet(corpus);
  const configs = options.tune ? buildSearchConfigs(options.withModel) : [singleRunConfig(options.withModel)];

  let best = null;
  for (const config of configs) {
    const run = await evaluateCorpus(corpus, fields, config);
    if (!best || run.summary.micro.f1 > best.summary.micro.f1) {
      best = run;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    corpusPath,
    sampleCount: corpus.length,
    fields,
    tuningEnabled: Boolean(options.tune),
    includeModel: Boolean(options.withModel),
    bestConfig: best.config,
    summary: best.summary,
    perField: best.perField,
    sampleResults: best.sampleResults,
  };

  const outputPath = path.resolve(options.out || DEFAULT_REPORT_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  printConsoleSummary(report, outputPath);
}

function parseArgs(argv) {
  const options = {
    tune: false,
    withModel: false,
    corpus: "",
    out: "",
    fields: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--tune") {
      options.tune = true;
      continue;
    }

    if (arg === "--with-model") {
      options.withModel = true;
      continue;
    }

    if (arg === "--corpus") {
      options.corpus = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (arg === "--out") {
      options.out = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (arg === "--fields") {
      const raw = argv[i + 1] || "";
      options.fields = raw
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
  }

  return options;
}

function singleRunConfig(withModel) {
  return {
    heuristicWeight: 1,
    modelWeight: withModel ? 1 : 0,
    promptSignalWeight: 1,
    includeModel: withModel,
  };
}

function buildSearchConfigs(withModel) {
  const heuristicWeights = [0.8, 1, 1.2];
  const modelWeights = withModel ? [0.7, 0.9, 1.1, 1.3] : [0];
  const promptWeights = withModel ? [0.8, 1, 1.2] : [1];

  const configs = [];
  for (const heuristicWeight of heuristicWeights) {
    for (const modelWeight of modelWeights) {
      for (const promptSignalWeight of promptWeights) {
        configs.push({
          heuristicWeight,
          modelWeight,
          promptSignalWeight,
          includeModel: withModel,
        });
      }
    }
  }

  return configs;
}

function deriveFieldSet(corpus) {
  const fields = new Set();
  corpus.forEach((sample) => {
    Object.keys(sample.expected || {}).forEach((key) => fields.add(key));
  });

  return Array.from(fields);
}

async function evaluateCorpus(corpus, fields, config) {
  const perFieldStats = Object.fromEntries(
    fields.map((fieldPath) => [fieldPath, { tp: 0, fp: 0, fn: 0, support: 0 }])
  );

  const sampleResults = [];

  for (const sample of corpus) {
    const extraction = await extractProfileForHarness({
      sourceType: sample.sourceType,
      sourceLabel: sample.sourceLabel || sample.id,
      text: sample.text || "",
      portfolioUrl: sample.portfolioUrl || "",
      includeModel: config.includeModel,
      heuristicWeight: config.heuristicWeight,
      modelWeight: config.modelWeight,
      promptSignalWeight: config.promptSignalWeight,
    });

    const mismatches = [];

    for (const fieldPath of fields) {
      const expectedValue = canonicalizeFieldValue(sample.expected ? sample.expected[fieldPath] : "", fieldPath);
      const predictedValue = canonicalizeFieldValue(getAtPath(extraction.profile, fieldPath), fieldPath);

      if (expectedValue) {
        perFieldStats[fieldPath].support += 1;
      }

      if (expectedValue && predictedValue) {
        if (expectedValue === predictedValue) {
          perFieldStats[fieldPath].tp += 1;
        } else {
          perFieldStats[fieldPath].fp += 1;
          perFieldStats[fieldPath].fn += 1;
          mismatches.push({ fieldPath, expected: expectedValue, predicted: predictedValue });
        }
        continue;
      }

      if (expectedValue && !predictedValue) {
        perFieldStats[fieldPath].fn += 1;
        mismatches.push({ fieldPath, expected: expectedValue, predicted: "" });
        continue;
      }

      if (!expectedValue && predictedValue) {
        perFieldStats[fieldPath].fp += 1;
        mismatches.push({ fieldPath, expected: "", predicted: predictedValue });
      }
    }

    sampleResults.push({
      id: sample.id,
      sourceType: sample.sourceType,
      extractionMode: extraction.extractionMode,
      modelAvailable: extraction.modelAvailable,
      mismatchCount: mismatches.length,
      mismatches,
    });
  }

  const perField = {};
  let totalTp = 0;
  let totalFp = 0;
  let totalFn = 0;

  for (const [fieldPath, stats] of Object.entries(perFieldStats)) {
    const precision = ratio(stats.tp, stats.tp + stats.fp);
    const recall = ratio(stats.tp, stats.tp + stats.fn);
    const f1 = f1Score(precision, recall);

    perField[fieldPath] = {
      ...stats,
      precision,
      recall,
      f1,
    };

    totalTp += stats.tp;
    totalFp += stats.fp;
    totalFn += stats.fn;
  }

  const microPrecision = ratio(totalTp, totalTp + totalFp);
  const microRecall = ratio(totalTp, totalTp + totalFn);
  const microF1 = f1Score(microPrecision, microRecall);

  const macroF1 =
    Object.keys(perField).length > 0
      ? Number(
          (
            Object.values(perField).reduce((sum, field) => sum + field.f1, 0) /
            Object.keys(perField).length
          ).toFixed(4)
        )
      : 0;

  return {
    config,
    perField,
    sampleResults,
    summary: {
      micro: {
        precision: microPrecision,
        recall: microRecall,
        f1: microF1,
      },
      macroF1,
      totals: {
        tp: totalTp,
        fp: totalFp,
        fn: totalFn,
      },
    },
  };
}

function canonicalizeFieldValue(value, fieldPath) {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim().toLowerCase())
      .filter(Boolean)
      .sort()
      .join("|");
  }

  const raw = String(value).trim();
  if (!raw) return "";

  if (/\.email$/i.test(fieldPath)) {
    return raw.toLowerCase();
  }

  if (/\.phone$/i.test(fieldPath)) {
    return raw.replace(/\s+/g, " ").replace(/[^\d+()\-\s]/g, "").trim();
  }

  if (/identity\.socials\./i.test(fieldPath) || /website/i.test(fieldPath)) {
    return (normalizeExternalUrl(raw) || raw.toLowerCase()).replace(/\/+$/, "/");
  }

  if (/primaryRole$/i.test(fieldPath)) {
    return raw.toLowerCase();
  }

  return raw.toLowerCase();
}

function getAtPath(target, pathExpression) {
  const parts = String(pathExpression || "").split(".").filter(Boolean);
  let pointer = target;

  for (const part of parts) {
    if (!pointer || typeof pointer !== "object" || !(part in pointer)) {
      return "";
    }
    pointer = pointer[part];
  }

  return pointer;
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(4));
}

function f1Score(precision, recall) {
  if (!precision || !recall) return 0;
  return Number(((2 * precision * recall) / (precision + recall)).toFixed(4));
}

function printConsoleSummary(report, outputPath) {
  const { bestConfig, summary, perField, sampleResults } = report;

  console.log("Accuracy harness complete.");
  console.log(`Report: ${outputPath}`);
  console.log(
    `Best config => heuristicWeight=${bestConfig.heuristicWeight}, modelWeight=${bestConfig.modelWeight}, promptSignalWeight=${bestConfig.promptSignalWeight}, includeModel=${bestConfig.includeModel}`
  );
  console.log(
    `Micro metrics => precision=${summary.micro.precision}, recall=${summary.micro.recall}, f1=${summary.micro.f1} | Macro F1=${summary.macroF1}`
  );

  const sortedFields = Object.entries(perField).sort((a, b) => a[1].f1 - b[1].f1);
  console.log("Lowest-performing fields:");
  sortedFields.slice(0, 8).forEach(([fieldPath, stats]) => {
    console.log(
      `  ${fieldPath}: f1=${stats.f1}, precision=${stats.precision}, recall=${stats.recall}, support=${stats.support}, tp=${stats.tp}, fp=${stats.fp}, fn=${stats.fn}`
    );
  });

  const mostProblematic = [...sampleResults]
    .sort((a, b) => b.mismatchCount - a.mismatchCount)
    .slice(0, 5);

  console.log("Most mismatched samples:");
  mostProblematic.forEach((sample) => {
    console.log(
      `  ${sample.id}: mismatches=${sample.mismatchCount}, mode=${sample.extractionMode}, modelAvailable=${sample.modelAvailable}`
    );
  });
}

main().catch((error) => {
  console.error("Accuracy harness failed:", error && error.message ? error.message : error);
  process.exitCode = 1;
});
