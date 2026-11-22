# Decisions and assumptions

## Stack

React (TypeScript) + Node.js (TypeScript). Web is the fastest client that a reviewer can run without Xcode or Android Studio. Node matches the client language and is straightforward to containerise for AWS (ECS/Fargate later). Laravel would have been a reasonable backend, but I did not want a PHP toolchain as well as Node for the web build.

## Assumptions where the brief was unclear

1. **"I have chosen 5 products to be top rated"** means the five products with the highest rating, not a merchant-curated list. Tie-break on review count. Curated IDs can later be config or a CMS without changing the home page.
2. **Category "top rated" vs "additional":** the top 3 in that category by the same ranking, then the rest. Fake Store categories are small; a larger catalogue would keep the same split and raise the count.
3. **Search** is a case-insensitive substring across title, description, and category. No fuzzy search, no stemming. The search **button** is required by the criteria; submitting the form with Enter also works because that is normal web behaviour.
4. **Enquiry fields:** name, email, message (required); phone optional. There is no account, so we collect contact details on the form. This is an enquiry, not a checkout.
5. **Sales inbox** is configured as `sales@example.com`. Locally that address is captured by Mailpit. In production it would be a real mailbox fed by SES (or similar).
6. **Thank you** is a dedicated page after a successful POST, not only an inline banner, so refresh/back behaviour is obvious.
7. **Store name** "Field & Co." is a placeholder. Look and feel is intentionally tokenised in CSS so a later brand pass can replace type, colour, and copy.
8. **Currency** is USD because that is what Fake Store returns. Formatting uses `en-GB` only for display conventions.
9. **No persistence of enquiries.** Email is the MVP system of record. A database table can sit beside the mail send later.
10. Reviewers have **outbound HTTPS** so the API can reach fakestoreapi.com and the browser can load product images.

## Dropped or simplified

- **No mobile client.** Setup time and review friction would have eaten the time-box.
- **No real email provider.** Paid accounts are disallowed; Mailpit proves the email port.
- **No auth, cart, CMS, or admin.** Out of scope for the acceptance criteria.
- **No Playwright/Cypress.** HTTP tests cover the enquiry/search/category path on the API; component tests cover search submit, tile navigation, and enquiry validation. An E2E pass would be the next testing investment.
- **No shared package of types.** API and web duplicate the product DTO. Acceptable at this size; extract if a second client appears.

## How this grows past the PoC

```
Web (React)                API (Express)
  pages / CSS tokens         HTTP / validation
                             application services
                             ports: ProductCatalogue, EmailSender
                             adapters: Fake Store, SMTP
```

- Replace Fake Store by implementing `ProductCatalogue` (database, PIM, Shopify, etc.). Routes and UI stay.
- Replace Mailpit/SMTP by implementing `EmailSender` (SES, Postmark). Enquiry use case stays.
- Restyle via CSS variables without rewriting pages.
- Deploy on AWS with the same containers: web (S3+CloudFront or ECS), API (ECS/Fargate), mail (SES), config in SSM/Secrets Manager.

In-memory product cache (TTL) is already behind the adapter so a slower source does not block every page.

## Next day

- Persist enquiries and add a thin sales inbox in-app.
- Contract tests against a recorded Fake Store fixture; circuit breaker if the source is down.
- Playwright happy-path: home → category → product → enquiry → Mailpit.
- Merchant-curated featured IDs in config.
- Accessibility pass (focus order, image text, form errors).
- Push the API image to ECR and sketch a CDK or Terraform module.

## Time spent

About **2 hours 45 minutes**:

| Phase | Time |
| --- | --- |
| Planning and stack/architecture choices | 25 min |
| Building API, web, Docker | 1 hr 30 min |
| Tests | 25 min |
| Review, README, decisions, AI notes | 25 min |
