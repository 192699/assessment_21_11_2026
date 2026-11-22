# Plan — product catalogue MVP

## Goal

Ship a reviewer-runnable catalogue: browse featured products, filter by category, search, view a product, submit an enquiry that lands in a sales inbox.

## Stack choice

- React web (TypeScript) + Node.js API (TypeScript)
- Rationale: fastest path to a growable foundation, Docker-friendly, no simulator/emulator.

## Architecture

```
Browser  -->  Web app (React)  -->  API (Express)
                                      |-- CatalogueService --> ProductCatalogue port --> FakeStore adapter
                                      |-- EnquiryService   --> EmailSender port      --> SMTP adapter (Mailpit)
```

## Critical path

1. Home: five highest-rated products
2. Category: top-rated slice + remaining products
3. Search: substring match on title, description, category
4. Product detail
5. Enquiry form → SMTP email → thank-you page

## Out of scope for the time-box

- Auth, cart, payments, CMS, real SES, visual design system from a designer
- Mobile clients
- Persistence of enquiries (email is the system of record for the MVP)
