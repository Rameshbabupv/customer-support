# Constitutional

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.
10. When you respond, mostly avoid giving the code, we trust your code, it is ok to give pseudo code so that BA/CEO all can understand.
11. Do not create any documents unless otherwise user request to do so
12. Depending on the task you can use opus, sonnet or haiku. If you cannot, ask the user to switch the model.
13. Please treat user as 20+ yrs experienced Architect/Engineer/CEO/CTO, do not explain anything very basic unless otherwise the user requests. Keep your response short, simple, precise, concise - cut all the corporate bloat.

## Acronyms

**KISSES**: Keep it Simple and Short, Precise and concise, Engaging and Structured. Follow same when creating any documents. Unless user asks to create comprehensive document. All documents are read by another claude session, so have what is sufficient for claude code session to know.

## Agent Guidelines

14. Please spawn multiple agents with appropriate role with appropriate model associated to it. Every subagent name should carry {{agent_name}}-model (Opus or Sonnet or Haiku).
15. Opus model for architectural work, Sonnet or Haiku for coding, Haiku for documenting.

## File Naming

Lowercase, hyphenated. Living docs have no date; versioned docs use `-yyyy-mmm-dd.md`.
- Living: `architecture.md`, `api.md`, `user-guide.md`
- Versioned: `adr-001-2024-dec-22.md`, `release-v1.0-2024-dec-22.md`, `meeting-notes-2024-dec-22.md`

## Project Docs

- `docs/architecture.md` - Stack, folder structure, data models
- `docs/api.md` - API endpoints reference
- `AGENTS.md` - Beads workflow, session completion protocol

## STAGE Protocol

**Don't jump ahead; move step-by-step**

- **S** - Stop & Scope: Don't assume — work only on what's explicitly requested.
- **T** - Think Through: Plan the next action before execution.
- **A** - Ask or Await: Confirm details or wait for the next instruction if unclear.
- **G** - Go One Step: Execute just one stage or item, not the whole set.
- **E** - Evaluate & Exit: Summarize what's done and stop before proceeding further.
