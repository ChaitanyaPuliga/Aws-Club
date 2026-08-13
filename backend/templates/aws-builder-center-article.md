# Club Member Portal — AWS Builder Center Article

## What we built

Club Member Portal is a members-only knowledge assistant for AWS Student Builder Groups. Members sign up, sign in, browse the official starter document pack, and ask questions in plain language. Each answer cites the document and section it came from. If the answer is not in the pack, the assistant gives the campus AWS Student Builder contact instead of guessing.

## Who it helps

New Student Builders can quickly find onboarding guidance, workshop information, AWS account setup steps, Builder Center publishing instructions, and community information from one trusted place.

## Safe AI behavior

- Answers are grounded only in the eight club documents.
- Every document-backed answer includes its source file and section.
- Unknown questions use the fallback contact from `01-onboarding-faq.md`.
- Passwords and private student data are never logged.

## Screenshots to include

1. Welcome page
2. Sign-up and sign-in
3. Forgot-password flow
4. Dashboard
5. Chat answer with source
6. Unknown-question fallback

## AWS deployment plan

For a cloud deployment, Amazon Cognito would provide email/password authentication, Amazon SES would send reset emails, Amazon S3 would store the starter pack, and an API service on AWS App Runner or ECS would run the chat API. A managed PostgreSQL database would store profiles and chat history. Amazon Bedrock could replace the local keyword retrieval layer while preserving the document-only and source-citation rules.

## Tags

`#aws-student-builders-groups` `#buildonaws` `#amazon-bedrock` `#rag`
