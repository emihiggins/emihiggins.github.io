---
title: A crewAI scaffold that ran for ten minutes
date: 2026-09-01
summary: created my first crewAI crew. for me the framework was good, but the project scaffold wasn't, and the failure mode is expensive.
tags:
  - crewai
  - agents
---

today I worked on building my first [crewAI](https://docs.crewai.com) crew — I used the
project scaffold to create three agents. first: a researcher, second: a reporting analyst,
and third: a newsletter writer. code is in
[crewai-play](https://github.com/emihiggins/crewai-play).

I thought the framework itself was really cool. I liked that the agents, tasks, and the
crew are separate config files, and the terminal UI shows you what each agent is doing
while it does it.

but unfortunately for me the scaffolding wasn't too successful. `crewai create crew <name>`
gave me a project that runs, which is not the same as a project that works. my first
attempt at running the crew took **over ten minutes** and burned a large pile of tokens —
yes, I did watch this happen and could have stopped it, but I had picked a cheap model on
purpose so I wasn't actually that concerned.

## what actually went wrong

the newsletter-writer agent went first.

it was supposed to be third — read the researcher's bullets and the analyst's report, then
write the issue. and this is what confused me, because during the setup everything seemed
all good. but when I prompted it started immediately with nothing upstream of it, decided
it needed to figure out its own assignment, and used its file-writing tool as scratch
space to do that. by the time the run finished there were 48 files scattered across the
project root, including one where the agent had written itself a note about what its own
task probably meant.

two things were missing, and they compound:

**no `context` on the downstream tasks.** in crewAI, ordering in the `tasks` array isn't
the same as data dependency. a task only receives another task's output if you say so:

```jsonc
{
  "name": "newsletter_task",
  "agent": "newsletter_writter",
  "context": ["research_task", "report_task"]
}
```

without that, an agent that needs prior output has no prior output, and nothing tells it
to wait. I essentially did the opposite and assumed that the newsletter_writer agent
should have the newsletter_task, but I didn't give the newsletter_task the research_task
and report_task context.

**stub task descriptions.** the generator leaves `description` equal to the task name. but
`description` *is* the prompt. `"newsletter_task"` gives an agent no method, no scope, and
no stopping condition, so it improvises all three. that's where the ten minutes went.

fixing both took the same crew, same model, same topic to **41.8 seconds and one output
file**. the changes that mattered:

- state the method as numbered steps, not just the goal.
- cap the work explicitly: "consult AT MOST 8 sources".
- say what *not* to do: "do NOT write any files", "do NOT delegate".
- set `max_iter` (default is 25) and `allow_delegation: false` per agent. in a sequential
  pipeline, delegation only multiplies LLM calls.

two smaller papercuts from the same generator: it runs `git init` unconditionally, so you
get a nested `.git` inside your existing repo, and it scaffolds empty `tools/` and
`skills/` directories that `pyproject.toml` then requires — which git won't track, so a
fresh clone is broken until you add a `.gitkeep`.

## the part I want to automate

none of this needed a ten-minute run to diagnose. every symptom was visible in the config
before kickoff: a task consuming upstream output with no `context` array, a `description`
identical to its task name, `allow_delegation` left on inside a sequential process, no
`max_iter`, a file-writing tool handed to an agent whose task never mentions writing a
file. but given that this was my first ever crewAI crew, I'm not too upset with myself for
not double checking the project it scaffolded for me.

that's a static check, not a debugging session. so one of the next side quests on my list
is building an agent skill that reads a crew directory and flags the misconfigurations
before you spend anything running it. the expensive failure mode here isn't a crash — it's
a crew that technically succeeds while doing the wrong work slowly, and you only find out
after you've paid for it.
