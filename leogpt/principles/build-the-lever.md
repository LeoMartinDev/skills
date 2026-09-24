# Principle: build the lever

**When**: repetitive or bulk work (many similar edits, a data check, an audit), or a claim that needs proof.

**Rule**: write the tool that does the work or proves it (a script, a codemod, a query), instead of doing it by hand. The tool is what a reviewer can rerun.

## Do
- Script a change that repeats across more than a handful of files.
- Prove a claim ("no caller passes null") with a command, and put the command in the report.
- Keep the tool small and throwaway unless it will be reused.

## Don't
- Hand-edit 40 files and hope none were missed.
- Claim "I checked all usages" without showing how.

## Check
- Could someone rerun one command to confirm this work is complete?
