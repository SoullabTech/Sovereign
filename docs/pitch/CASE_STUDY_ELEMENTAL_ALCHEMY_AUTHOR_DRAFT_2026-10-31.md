# Case study (DRAFT for founder review, NOT published): The Author with a Finished Book — *Elemental Alchemy*

**Status:** draft prepared 2026-10-31. **Not published, not committed.** Governed by `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` and
`docs/canon/CLAIM_STATE_AUTHORITY.md`: the founder decides what Soullab chooses to claim; the evidence below only limits the highest state a claim may occupy.
**Use of the example:** the founder said in chat on 2026-10-31 "we can use mine as an example". That covers using the book as the example. It is **not** yet
consent to publish any manuscript text or screenshots of it, and none is used here.

**Stamp:** Carrier: **Human** (the author) · Layer: **Live (narrow), Designed upside** · CoG: **Live** · Failure Test: **survives only in the narrow form below** ·
**Verdict: ⚠️ Publish the narrow Live story only, after the checks in section 5.**

## 1. The challenge (the human one)
An author has a finished book with its own voice and lineage. She does not want a tool that rewrites it or guesses what it is. She wants a place where she can
talk about her book with someone who knows which book it is, and who changes nothing until she chooses.

## 2. The story (strong, Live version)
She brought her finished book into Writer's Studio. When she opened it in Develop and reached for "Talk with MAIA about this", the button was **unavailable**, and
the page said plainly that a Work connection for this manuscript could not be confirmed. The Studio will not guess which Work a manuscript belongs to. It waits for
the author to say. Once the book was declared part of her Work, *Elemental Alchemy*, the conversation opened **situated in that Work and that chapter**: the side panel
names the Work ("In relation to Elemental Alchemy"), and the page states that nothing is read or changed until she chooses.

**What is carried by whom:** the author names the Work; MAIA stays within it; the page keeps its promise about not reading or changing anything unasked.

## 3. What is Live, with the evidence (and its class)
| Claim | Evidence | Class |
|---|---|---|
| A finished manuscript can be held in the Studio as the author's own, chapter by chapter. | The author's own screenshot of her book's chapter list in Develop, 2026-10-31. | experiential (author-witnessed) |
| The Studio refuses to infer a Work and says so. | Author's screenshot of the disabled button and message; rule in `app/writers-studio/workContext.ts` ("Never a guess"). | experiential + code-read |
| After the Work is declared, the conversation is situated in the Work and chapter. | Author's screenshot "that works now" (side panel names the Work); production runtime `9856e27f7`; database read-back of the declaration. | experiential + runtime |
| "Nothing is read or changed until you choose it." | Page text as shown. **Not** independently tested here for what is read on later actions. | code/page text only |

## 4. What this story must NOT claim (Designed / Vision / unknown)
- **How good MAIA's reply was.** One reply has now been observed (founder, 2026-10-31, chapter 10). MAIA honestly said she could only see a bibliography under that heading and did not
  pretend to know the chapter, but she had been given a 558-character notes section and not the 73,000-character chapter, and she offered a wrong theory about the duplicate headings. The author's verdict: text too small, too
  condensed, too limited. **No claim that MAIA gave useful insight into the chapter is supportable.** The honest-about-what-she-saw behaviour is real but is not the payload this story needs.
- **That the author attached the book herself.** The declaration was recorded **by an operator at her instruction** (a database write on 2026-10-31), not through a
  self-serve step in the product. Whether a self-serve path exists in the UI is **unverified**. A public line saying "she connected her book to her Work" would be false as written.
- **Positive starter prompts** (overview, "what are you noticing", suggestion): **Designed** only; the current three starter cards are problem-framed and a change was proposed, not built.
- **Other writers' experience.** Only the founder's account was walked. No other writer has used this path.

## 5. Before any public use (checks, all outstanding)
1. Founder claim-state ruling on the narrow story in section 2.
2. A second recorded walk, after the wrong-place and readability fixes, on the real chapter (the first walk is recorded in the internal review, F4/F7/F8).
3. Founder consent for the book title and for any screenshot, with member data redacted (other chapter titles are the author's text).
4. The unavailable-button step softened or explained in the product so a new author is not stranded (otherwise the honest story ends in a dead end for most writers).
5. Failure Test on the final wording: strip everything in section 4; the section 2 story must still stand. It does today only because it makes no claim about MAIA's quality.

## 6. Drift to avoid
*"MAIA read my whole book and gave me deep insight into every chapter."* That moves the weight onto quality of reading and coverage we have not verified.
