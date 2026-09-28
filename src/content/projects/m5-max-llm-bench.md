---
title: m5-max-llm-bench
date: 2026-09-27
status: shipped
kind: research
summary: Measured LLM inference on a Mac Studio M5 Max — achieved memory bandwidth, why decode speed follows it, and 65 model benchmarks — with the harness and raw data to re-run every number.
stack:
  - Python
  - MLX
  - llama.cpp
  - Shell
links:
  - label: source
    url: https://github.com/emihiggins/m5-max-llm-bench
  - label: findings
    url: https://github.com/emihiggins/m5-max-llm-bench/blob/main/docs/bandwidth-findings.md
---

One Mac Studio — M5 Max, 40-core GPU, 48 GB unified memory — measured over two days.
Apple quotes 614 GB/s of memory bandwidth for this tier; the question was how much of it
LLM inference actually gets, and whether that number alone predicts decode speed.

## Results

Achieved bandwidth, median of 10 warm repetitions of MLX kernels: **550–552 GB/s** for a
DRAM-bound copy, about 90% of theoretical. Matrix–vector, the decode-shaped operation,
reaches 528 GB/s. The cache-to-DRAM transition sits at a 96–128 MiB working set, and a
rerun after a 30-minute cooldown landed within 0.4%.

Decode is bandwidth-bound. Dividing achieved bandwidth by bytes read per token gives an
upper bound, and the measured 4-bit models land just under it: Qwen3-8B at 111.9 tok/s
against a 121.9 bound (0.92), Qwen3-14B at 62.3 against 66.4 (0.94).

The mac-llm-bench protocol was run across 38 GGUF and 27 MLX models — everything in the
upstream registry fits in 48 GB — and submitted as
[mac-llm-bench#12](https://github.com/enescingoz/mac-llm-bench/pull/12). For dense models
of 24B and up, decode speed times file size works out to 456–501 GB/s of effective weight
traffic, consistent with the bandwidth figures.

## Method

Every record is schema-validated JSONL with full provenance: tool versions, git SHA, wired
memory limit. A thermal-nominal gate runs before every cell, runs are seeded and shuffled,
cold runs are excluded, and sweeps are resumable. 53 unit tests.

The bandwidth hypotheses were pre-registered and committed before the first run, so the
git history shows the order. Three of five held, one was partly refuted, one not supported
as registered — all reported.

One method change was made after seeing data, and is disclosed: the first sweep used
3–16 ms timing windows, which measured GPU clock ramp-up rather than bandwidth. The rerun
uses a warm-up and windows of at least 250 ms. The aborted run's records are kept in the
repo and excluded from the results.

## Limitations

One machine, one ambient temperature, one macOS build. The kernels are MLX-specific, so a
low figure could reflect MLX rather than the hardware. Two cache-curve features are
reported without an explanation. No joules-per-token number is claimed, because
`powermetrics` doesn't attribute all DRAM and fabric power.
