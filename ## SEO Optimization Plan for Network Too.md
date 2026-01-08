## SEO Optimization Plan for Network Tools Website

Please review the website structure and create an SEO plan for better visibility in searches.
### Current State
Your website has:

- **Basic HTML structure** with minimal SEO elements
- Only basic `<title>` tags present
- **No meta descriptions, keywords, or structured data**
- No Open Graph or Twitter Card tags for social sharing
- No canonical URLs or author information

### Recommended SEO Improvements

I propose adding the following to **all HTML files**:

#### 1. **Essential Meta Tags**
- **Meta Description** (150-160 characters) - Compelling summary for search results
- **Meta Keywords** - Relevant keywords for the page
- **Author & Copyright** information
- **Robots directives** (index, follow)

#### 2. **Open Graph Tags** (for social media sharing)
- og:title, og:description, og:type
- og:url, og:site_name
- og:image (you may want to create a logo/preview image)

#### 3. **Twitter Card Tags**
- twitter:card, twitter:title, twitter:description
- Enhanced appearance when shared on Twitter/X

#### 4. **Structured Data (JSON-LD)**
- Schema.org markup for WebApplication/SoftwareApplications
- Helps search engines understand your tools
- Improves rich snippet potential

### Proposed Content Strategy

**Main Site (index.html):**
- Description: "Free offline network and sysadmin tools including subnet calculators, CIDR converters, password generators, and more. No installation required."
- Keywords: network tools, subnet calculator, CIDR converter, sysadmin utilities, network utilities

**Individual Tool Pages:**
Each tool will get customized descriptions and keywords based on its function.

### Implementation Approach

For each HTML file, I'll add a comprehensive `<head>` section with:
- All SEO meta tags customized for that specific tool
- Structured data describing the application
- Social sharing optimization
- Proper language and viewport settings (already present)


site name is oldweb.tech
author would be OldWeb LLC

After implementation:
 1. Validate HTML with W3C validator on sample pages
 2. Test Open Graph tags with Facebook Sharing Debugger
 3. Test Twitter Cards with Twitter Card Validator
 4. Verify sitemap.xml is accessible at https://oldweb.tech/sitemap.xml
 5. Verify robots.txt is accessible at https://oldweb.tech/robots.txt
 6. Use Google Rich Results Test for structured data validation
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌