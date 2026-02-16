---
description: Generate promotional forum posts for web tools
argument-hint: category (network, financial, data, system) or "all"
---

# Promotional Post Generator

Generate engaging, informal forum posts to promote oldweb.tech tools. Posts should be conversational, honest, and focused on solving real problems without marketing fluff.

## Voice & Tone Guidelines

- **Conversational**: Write like you're telling a colleague about something useful you made
- **Honest**: No hype, no exaggeration - just practical value
- **Problem-focused**: Lead with the pain point, not the solution
- **Anti-corporate**: No tracking, no signup, no BS - make this a selling point
- **Technical but accessible**: Assume smart audience but don't gatekeep

## Post Structure Pattern

Based on successful posts in `/mnt/github/mycode/promos/`:

1. **Hook** (1-2 sentences): State the problem/use case
2. **Solution intro** (1 sentence): Introduce the site/tools
3. **Feature highlights** (2-3 sentences): What tools do, specific value props
4. **Technical benefits** (1-2 sentences): Offline, no tracking, browser-based
5. **Personal touch** (1 sentence): Why you built it / how it helped you
6. **Optional**: Educational angle (if tools teach concepts)
7. **Call to action**: URL (repeat at end)

## Argument Handling

$ARGUMENTS

- **network**: Generate post for networking/sysadmin tools
- **financial**: Generate post for financial calculators
- **data**: Generate post for data manipulation tools
- **system**: Generate post for system admin tools
- **all**: Generate overview post covering all categories

## Tool Categories Reference

Read from `/mnt/github/mycode/public_html/` to find available tools:

### Network Tools
- Subnet calculators (IPv4/IPv6)
- CIDR notation converters
- MTU calculator
- Bit/byte calculators
- Data rate calculators

### Financial Tools
- Amortization calculator
- Debt payoff comparison
- Compound interest calculator
- Retirement calculator

### Data Tools
- String manipulation (case converters, etc)
- Base64/hash encoders
- Text diff utilities
- Regex tester

### System Tools
- chmod calculator
- Cron expression builder
- Password generator
- Timestamp converters

## Output Format

Generate TWO versions:

### 1. Markdown version (`{category}-forum-post.md`)
- Use `www.oldweb.tech/{category}` for links (without https://)
- Include line breaks for readability
- Save to `/mnt/github/mycode/promos/`

### 2. Plain text version (`{category}-forum-post.txt`)
- Use `https://www.oldweb.tech/{category}` for links
- Optimized for copying into forums/social media
- Save to `/mnt/github/mycode/promos/`

## Example Patterns from Existing Posts

### Financial Post Pattern:
```
[Problem statement: debt/loans/understanding payments]
[Site intro with specific URL]
[Tool 1 detail + value] [Tool 2 detail + value]
[Additional tools briefly]
[Technical benefits: free, offline, no tracking, browser-based]
[Personal story: helped me understand my own situation]
[Educational value: explains concepts]
[URL repeat]
```

### Network Post Pattern:
```
[Audience targeting: networking/sysadmin work]
[Site intro with general URL]
[Tool listing: "usual suspects" approach]
[Technical benefits: browser-based, offline, fast, no tracking]
[Origin story: tired of hunting utilities/bloated pages]
[Practical value: bookmark it, works when needed]
[URL repeat]
```

## Writing Tips

- **Use contractions**: "I've" not "I have", "you're" not "you are"
- **Casual asides**: "(spoiler: way more than you think)", "(because why not)"
- **Avoid**: "amazing", "powerful", "robust", "leverage", "solution"
- **Include**: Specific pain points, real use cases, honest limitations
- **Be specific**: "sub-50ms" not "fast", "no signup" not "easy to use"

## Process

1. **Read the category**: Check `/mnt/github/mycode/public_html/{category}/` for available tools
2. **Identify 2-3 hero tools**: Main features to highlight
3. **Find the pain point**: What problem does this category solve?
4. **Draft the post**: Follow pattern, keep it under 150 words
5. **Generate both versions**: .md and .txt with appropriate URL formatting
6. **Save to promos/**: Use naming convention `{category}-forum-post.{md,txt}`

## Quality Checklist

- [ ] Sounds like a human wrote it (read it aloud)
- [ ] Leads with a real problem/use case
- [ ] Mentions "no tracking/signup/analytics"
- [ ] Includes "offline" or "browser-based" benefit
- [ ] Has personal element (why you built it)
- [ ] Under 150 words
- [ ] URL appears at beginning and end
- [ ] No marketing buzzwords
- [ ] Would you actually post this yourself?

---

Generate promotional content that network engineers and sysadmins would actually want to click on and share.
