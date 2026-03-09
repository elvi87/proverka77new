# AGENTS.md

## Goal
Autonomous coding agent for `proverka77new` that creates safe PRs.

## Hard restrictions
- NEVER edit paths:
  - migrations/**
  - billing/**
  - prod-config/**
- Do not add secrets to code.
- Do not disable tests/lint/security checks.
- Keep changes minimal and scoped to the task.

## Definition of done
- Code compiles.
- Existing tests/linters pass.
- PR has clear title/body and change summary.
