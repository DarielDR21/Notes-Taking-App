<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Operator Approval

Do not use Computer Use, browser automation, or any similar GUI-driving tool in this repository unless the user explicitly approves it first in the current conversation.


# structure 

.
├── .env.local
├── .github
│   └── workflows
│       └── ci.yml
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── auth
│   │   ├── auth-actions.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login
│   │   ├── notes
│   │   ├── page.tsx
│   │   └── signup
│   ├── components
│   │   ├── auth
│   │   ├── notes
│   │   ├── theme
│   │   └── ui
│   ├── lib
│   │   ├── database.types.ts
│   │   ├── notes
│   │   ├── supabase
│   │   └── utils.ts
│   └── proxy.ts
├── supabase
│   ├── .gitignore
│   ├── .temp
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── linked-project.json
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   ├── rest-version
│   │   ├── storage-migration
│   │   └── storage-version
│   ├── config.toml
│   └── migrations
│       ├── 20260521170021_create_notes.sql
│       ├── 20260524120000_add_trashed_at_to_notes.sql
│       ├── 20260524174542_create_tags_table.sql
│       ├── 20260524174549_create_note_tags_table.sql
│       └── 20260524174557_drop_notes_tags_column.sql
├── tsconfig.json
└── tsconfig.tsbuildinfo

