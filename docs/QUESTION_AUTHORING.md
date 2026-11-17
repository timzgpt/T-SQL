# SQL Academy question authoring guide

This guide defines how to build a large, original question bank from the course's `.vtt` caption files and organize it around the learning progression **Memorize → Understand → Practice → Reflect → Transfer**.

## Target size

The requested target is **100 questions for every learning stage, for every `.vtt` file**:

| Per caption file | Questions |
|---|---:|
| Memorize | 100 |
| Understand | 100 |
| Practice | 100 |
| Reflect | 100 |
| Transfer | 100 |
| **Total per `.vtt`** | **500** |

The current `course-materials/` inventory contains 294 `.vtt` files. At this target, the complete bank would contain **147,000 questions**. Recount the files before each production batch because the inventory can change.

This is a target, not a reason to pad a narrow lesson with duplicates or unsupported facts. If a caption file does not support 100 distinct, useful questions for a stage, record the shortfall and request approved supplemental learning objectives.

## Rights and source use

Before creating or publishing questions, confirm that the applicable license or permission covers adapting the course material into a question bank and distributing that bank. Permission to keep or copy source files is not automatically permission to publish derivative questions. Do not send the course files to an external generation service unless that use is authorized.

Use captions to identify concepts, terminology, and learning objectives. Write **new question wording, examples, schemas, values, distractors, hints, and explanations**. Do not copy or closely paraphrase lecture sentences, distinctive analogies, instructor exercises, or answer sequences. Keep source excerpts out of the published question bank.

## The five stages

The stage describes the learning work a question asks the learner to do. It is independent of its format: a multiple-choice item can be Practice or Reflect, and a coding item can be Practice or Transfer.

| Stage | Learner action | Good question patterns | Avoid |
|---|---|---|---|
| **Memorize** | Retrieve essential facts, names, syntax, and definitions from memory. | Name a SQL component; recall a clause's basic role; recognize valid syntax or terminology. | Multi-step problem solving disguised as recall. |
| **Understand** | Explain meaning, relationships, and consequences. | Distinguish two concepts; explain why a clause changes a result; predict what a function returns and explain why. | Asking only for a memorized label. |
| **Practice** | Apply a taught technique with familiar concepts. | Complete a query; choose or write a filter; repair a simple syntax or logic error. | Repeating the lecture's exact worked example. |
| **Reflect** | Inspect reasoning, errors, assumptions, and learning. | Diagnose why a plausible query is wrong; explain a correction; compare two approaches and justify one. | “How confident are you?” without evidence of reasoning. |
| **Transfer** | Apply knowledge in a new context or unfamiliar combination of concepts. | Solve a new business request with a different schema; adapt a known technique to a new constraint; choose a safe approach in a realistic scenario. | Changing only table or value names in a copied example. |

When a question could fit two stages, choose the highest cognitive action it genuinely requires. Do not label an item Transfer just because it has a story, or Reflect just because it asks “why.”

## Workflow for each `.vtt`

1. **Create a stable source ID.** Use the relative path under `course-materials/`, normalized as a lowercase slug. Keep the original file path in the authoring manifest.
2. **Parse captions into cues.** Ignore the `WEBVTT` header and cue numbering; retain each cue's start/end time; join wrapped caption lines; remove markup and non-spoken noise without changing SQL tokens. Keep cue boundaries so each draft can cite its evidence location.
3. **Build an objective map.** Summarize the concepts taught as short, testable objectives in original wording. Group repeated caption cues under the same objective. Do not treat every caption line as a separate objective.
4. **Plan five separate sets of 100.** Map each objective to stages and formats before drafting. Track counts by stage, objective, format, and difficulty. A concept may appear at several stages only when the learner task becomes meaningfully more demanding.
5. **Draft original items.** Use new SQL schemas and examples. Ensure each question tests one main objective and can be answered from the lesson's concepts or clearly marked prerequisites.
6. **Add feedback.** Provide a concise hint, a correct answer, and an explanation that teaches the underlying rule. For Reflect items, explain the reasoning or error. For Transfer scenarios, explain why the selected approach works in that new context.
7. **Review and validate.** Check SQL Server/T-SQL correctness, answer uniqueness, stage fit, source support, accessibility, and duplicates before accepting an item into the bank.
8. **Publish in batches.** Approve and integrate one `.vtt` at a time. Do not load all 147,000 questions into the current static quiz bundle at once; the app needs partitioned/lazy-loaded question data before the full bank is practical.

## Suggested format and difficulty mix

Formats are selected to serve the learning objective, not to fill a quota mechanically. The following is a starting blueprint **per 100-question stage set**; adjust it when a format does not fit the source objectives.

| Stage | Multiple choice | True/false | Short answer | Matching | SQL coding | Scenario |
|---|---:|---:|---:|---:|---:|---:|
| Memorize | 35 | 20 | 25 | 15 | 5 | 0 |
| Understand | 30 | 10 | 20 | 20 | 10 | 10 |
| Practice | 15 | 5 | 10 | 10 | 40 | 20 |
| Reflect | 20 | 10 | 20 | 10 | 15 | 25 |
| Transfer | 15 | 5 | 10 | 10 | 20 | 40 |

Aim for a varied difficulty mix in each stage, for example 25 easy, 50 medium, and 25 hard questions. Difficulty means the reasoning and prerequisite load, not obscure wording or trick answers.

## Question data contract

The app's `RawQuestion` type is defined in `lib/types.ts`. Every question must have a `learningStage`; the quiz registry rejects questions without one.

```ts
{
  topic: "Filtering",
  learningStage: "practice",
  format: "coding",
  q: "Write a query that returns orders above a stated threshold.",
  context: "Use the supplied Orders table and column names.",
  code: "CREATE TABLE Orders (OrderId int, Total decimal(10,2));",
  options: [],
  answer: "SELECT OrderId FROM Orders WHERE Total > 500;",
  acceptedAnswers: ["SELECT OrderId FROM Orders WHERE Total>500"],
  hint: "Keep rows whose Total is greater than the threshold.",
  explain: "WHERE filters rows before they are returned.",
  difficulty: "medium"
}
```

Adapt the sample schema and values for each question; this example is a shape illustration, not a question to duplicate.

Format-specific requirements:

- **Multiple choice, true/false, and scenario:** the `answer` must exactly match an entry in `options`. True/false questions must include `"True"` and `"False"`.
- **Short answer and coding:** provide `acceptedAnswers` for legitimate alternatives. Current grading normalizes case and whitespace; it does not execute SQL or prove semantic equivalence.
- **Matching:** provide `matchPairs`, the answer options, and an `answer` containing the JSON array of right-side values in pair order.
- **Scenario:** provide a clear `context` and a `scenarioBranches` outcome for every option, not only the correct one.

Keep provenance in a separate authoring manifest unless the app's types are extended. Recommended fields are `sourceId`, `sourceFile`, cue start/end timestamps, learning objective, stage rationale, reviewer, review status, and a stable draft ID. Do not put caption text into this manifest.

## Quality gates

An item is ready only when all checks pass:

- **Stage fit:** the learner action matches its assigned stage.
- **Source support:** the tested concept is supported by an objective in the source or is explicitly identified as an approved prerequisite.
- **Originality:** the stem, examples, and feedback are independently written, not copied or close paraphrases.
- **Answer quality:** there is one defensible correct answer; distractors are plausible, distinct, and explainable.
- **T-SQL correctness:** code and syntax are valid for the intended SQL Server version and context.
- **Useful feedback:** hints do not reveal the answer immediately; explanations teach rather than merely restate it.
- **No duplication:** compare normalized stems and tested objectives across all stages and neighboring caption files. Reject superficial permutations.
- **Coverage:** each `.vtt` has exactly 100 approved questions per stage, or a documented shortfall awaiting approved supplemental objectives.
- **App validation:** run the TypeScript check and production build; then test each stage's question count, runner, answer grading, and results review.

## Current app limitations

The app currently stores authored question banks in TypeScript under `lib/quizzes/` and imports them through `lib/quizzes/index.ts`. It filters by the five `learningStage` values, but it does not parse VTT files or generate questions automatically. Supporting the full target requires a separate ingestion/authoring pipeline, question-bank storage partitioned by source file, and lazy loading or another strategy that avoids shipping every question to every learner.
