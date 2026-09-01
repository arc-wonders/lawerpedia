export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  author: string;
}

export const articles: Article[] = [
  {
    id: 'data-privacy-ai',
    title: 'Data Privacy in the Age of Artificial Intelligence: A Global Legal Reckoning',
    summary: 'Examining how the world\'s major legal systems are responding to the intersection of artificial intelligence and personal data — and where the law is still catching up.',
    createdAt: '2026-08-15',
    author: 'aawath',
    content: `Every second, billions of data points are generated, harvested, processed, and monetised, often without the meaningful knowledge or consent of the individuals they describe. In 2024 alone, global regulators issued fines totalling more than €4 billion for data protection violations. And yet, the intersection of artificial intelligence and personal data remains one of the most under-regulated, legally ambiguous, and consequential frontiers of our time. This article examines how the world's major legal systems are responding and where the law is still catching up.

I. The Regulatory Landscape: A Patchwork in Motion

The General Data Protection Regulation (GDPR) of the European Union remains the gold standard of data privacy law globally. Since its enforcement began in May 2018, it has fundamentally shifted the relationship between data subjects and data controllers, enshrining rights to access, erasure, portability, and objection. Its extraterritorial reach, applying to any entity that processes data of EU residents, regardless of where that entity is based, has made it a de facto global benchmark.

India entered this regulatory conversation decisively with the Digital Personal Data Protection Act, 2023 (DPDPA). The Act marks a significant departure from India's earlier piecemeal approach under the Information Technology Act, 2000. It introduces the concept of a 'Data Fiduciary' and 'Data Principal', imposes consent obligations, mandates data localisation for certain categories of sensitive data, and establishes the Data Protection Board of India as the adjudicatory body. While the statute draws inspiration from the GDPR, it is importantly calibrated to India's developmental priorities, permitting broader governmental exemptions and adopting a principles-based rather than prescriptive framework.

Meanwhile, the United States continues to operate without a comprehensive federal privacy law, relying instead on a sectoral patchwork of HIPAA for health data, COPPA for children's data, and GLBA for financial information supplemented by state-level legislation such as the California Consumer Privacy Act. This fragmentation increasingly strains businesses operating across state lines and creates regulatory arbitrage opportunities that undermine consumer protection.

II. The AI Problem: When Personal Data Becomes Training Data

The advent of large language models and generative AI has created an entirely new category of data privacy challenge. Unlike traditional data processing, where a company collects specific information for a defined purpose, AI systems consume vast, often indiscriminate datasets during training, embedding personal information into model weights in ways that may be irreversible and difficult to audit.

The Court of Justice of the European Union's landmark ruling in Schrems II had already exposed the fragility of transatlantic data transfer frameworks. The concern is now compounded: when personal data used to train an AI model is transferred across borders, which jurisdiction's law governs? If a model trained on EU citizens' data is hosted on servers in the United States and accessed from India, the question of applicable law becomes genuinely intractable under current frameworks.

The GDPR offers some guidance. Article 22 restricts purely automated decision-making with significant effects on individuals, requiring human oversight and the ability to contest such decisions. The European Data Protection Board has taken a robust position on facial recognition technology in particular, recommending a general prohibition in law enforcement contexts pending stronger safeguards. But the law was not written with generative AI in mind, and regulators are visibly struggling to apply eighteenth-century legal concepts, consent, purpose limitation, and data minimisation to twenty-first-century technology.

III. Consent: A Fiction We Maintain

Perhaps no principle in data privacy law is more widely invoked and more routinely violated in spirit than consent. The notice-and-consent model under which individuals are presented with lengthy, opaque privacy policies and asked to click 'I agree' has long been identified by scholars as functionally meaningless. Studies consistently show that the average consumer would need over 200 hours per year to read the privacy policies of every service they use.

The DPDPA attempts to address this through the concept of 'free, specific, informed, unconditional, and unambiguous' consent, communicated in plain language and accompanied by an itemised notice. India's Supreme Court, in the landmark Puttaswamy judgment, had already elevated privacy to the status of a fundamental right under Article 21 of the Constitution, a constitutional anchor that gives statutory data protection laws considerably greater force.

The deeper problem, however, is structural. In an ecosystem where dominant platforms exercise enormous market power, consent is rarely truly voluntary. Competition regulators are beginning to recognise this: the Competition Commission of India, in proceedings against WhatsApp, found that the 2021 privacy policy update constituted an abuse of dominant position, effectively conditioning service access on data sharing that exceeded what users could meaningfully refuse.

IV. Cross-Border Data Flows: Sovereignty vs. Connectivity

Data localisation, the requirement that certain data be stored and processed within national borders, has emerged as one of the most contentious issues in international data governance. China's Personal Information Protection Law (PIPL) mandates security assessments before sensitive personal information can cross its borders. India's DPDPA empowers the Central Government to restrict cross-border transfers to notified countries, with criteria yet to be fully defined by subordinate legislation. While such measures are defensible on national security grounds, they risk Balkanising the global internet and imposing disproportionate compliance costs on smaller enterprises.

The OECD's Privacy Framework, now over four decades old, articulated the principle that personal data flows between member countries should not be restricted except for legitimate reasons, a principle that remains technically operative but increasingly under political pressure as data becomes synonymous with geopolitical power.

The challenge for international lawyers is significant: how do we construct a workable multilateral framework for data governance when the very states involved have fundamentally different visions of privacy, sovereignty, and the legitimate role of government in digital life?

V. The Road Ahead: Principles for a Coherent Framework

Several principles, drawn from comparative law and international human rights frameworks, offer a path forward.

First, the right to privacy must be understood not merely as an individual right but as a collective social infrastructure. The United Nations General Assembly's 2013 resolution on the right to privacy in the digital age recognised that mass surveillance, whether by states or corporations, undermines democratic governance and chills the exercise of other fundamental rights. Privacy law must be designed to protect this collective dimension, not merely to empower individual opt-outs.

Second, purpose limitation and data minimisation must be given genuine teeth in the AI context. Regulators must develop workable standards for what constitutes 'compatible' secondary use of personal data in AI training standards that go beyond vague proportionality assessments and provide actionable guidance to developers and deployers.

Third, algorithmic accountability must become a first-order legal obligation. The right to an explanation, the right to contest automated decisions, and requirements for ex ante impact assessments should not be treated as administrative add-ons but as core elements of the duty of care that AI operators owe to those whose data and lives their systems affect.

Finally, international cooperation must be reinvigorated. A world of fragmented, competing data sovereignty regimes is in no one's long-term interest. The legal profession has a central role to play not just in advising clients on compliance but in shaping the treaty frameworks, regulatory standards, and judicial interpretations that will define digital life for the next generation.

Conclusion

Data privacy law is no longer a niche compliance function. It sits at the intersection of constitutional rights, market regulation, national security, and the ethics of technology. The individuals whose data flows through global networks deserve legal frameworks that are coherent, enforceable, and genuinely protective, not systems that generate the appearance of consent while perpetuating opacity.

The law is catching up. But in technology, catching up is rarely enough.`,
  },
  {
    id: 'foreign-arbitral-awards-india',
    title: 'Foreign Arbitral Awards in India: Why Indian Courts Cannot Set Them Aside',
    summary: 'Unpacking a frequently misunderstood legal reality: Indian courts do not possess the jurisdiction to "set aside" a foreign arbitral award — they can only enforce or refuse to enforce it.',
    createdAt: '2026-08-10',
    author: 'aawath',
    content: `In the world of international commercial arbitration, few misconceptions are as consequential and as common as the belief that a foreign arbitral award can be challenged before Indian courts in the same manner as a domestic one. This article unpacks a straightforward but frequently misunderstood legal reality: Indian courts do not possess the jurisdiction to "set aside" a foreign arbitral award. What they can do is enforce it, or refuse to enforce it, on a narrow and well-defined set of grounds.

Understanding this distinction is not merely an academic exercise. It has significant practical consequences for litigants, corporate counsel, and arbitration practitioners operating across borders. The following analysis traces the statutory architecture of the Arbitration and Conciliation Act, 1996 ("the Act") and the Supreme Court of India's landmark jurisprudence on the subject.

I. The Core Legal Distinction: Setting Aside vs. Refusing Enforcement

At the heart of international arbitration law lies a fundamental dichotomy between two distinct remedies.

Setting Aside (Annulment): The power to annul or set aside an arbitral award belongs exclusively to the courts of the "seat" of the arbitration, that is, the primary legal jurisdiction to which the arbitration is tethered. If parties agree that their arbitration shall be seated in Singapore, only the courts of Singapore have the supervisory authority to set aside the resulting award. This principle of territorial exclusivity is universally accepted under the UNCITRAL Model Law framework and the New York Convention on the Recognition and Enforcement of Foreign Arbitral Awards, 1958.

Refusal of Enforcement: When a successful party seeks to enforce a foreign award in India, typically because the losing party holds assets within Indian jurisdiction, Indian courts step in not as supervisory courts but as enforcement courts. Their role is limited to one binary decision: enforce or refuse to enforce. They do not sit in appeal over the merits of the award.

II. The Statutory Framework: Sections 34 and 48 of the Act

A. Section 34 (Part I): Setting Aside Domestic Arbitral Awards

Section 34 of the Act provides the mechanism for challenging an arbitral award before the court of the seat. Critically, Part I of the Act, which houses Section 34, applies only to arbitrations seated in India. Following the Supreme Court's landmark ruling in Bharat Aluminium Co. v. Kaiser Aluminium Technical Services Inc. (BALCO), Part I has no application to foreign-seated arbitrations. Accordingly, Section 34 is simply not available to a party seeking to challenge a foreign arbitral award in India.

The grounds on which a domestic award may be set aside under Section 34(2) are exhaustive and include:

Incapacity of a party (as defined under Sections 11 and 12 of the Indian Contract Act, 1872); An invalid arbitration agreement (including oral agreements or agreements suffering from uncertainty or unlawfulness under Sections 23, 28, and 29 of the Indian Contract Act, 1872, read with Section 7 of the Act); Lack of proper notice to a party, violating the principles of natural justice and Section 12(2) of the Act; The award falling outside the scope of the arbitration agreement, including where the subject matter is non-arbitrable. The Supreme Court in Booz Allen & Hamilton Inc. v. SBI Home Finance Ltd., as extended by Vimal Kishor Shah & Others v. Jayesh Dinesh Shah & Others, established the so-called "Booz Allen list" of non-arbitrable disputes encompassing matters of public policy, matrimonial status, criminal offences, guardianship, insolvency, and statutory tenancy, which constitute rights in rem and must be decided by courts or specialised tribunals; Improper composition of the tribunal in contravention of Sections 10 to 15 of the Act; and Conflict with the "public policy of India," which encompasses awards violating fundamental principles of Indian law or constitutional guarantees.

Section 34(2A) additionally permits a domestic award to be set aside on the ground of "patent illegality" appearing on the face of the award, a ground not available in the enforcement context under Section 48.

Procedurally, an application under Section 34 must be filed within three months of receiving the award, with a maximum extension of thirty days available upon sufficient cause. The court is required to dispose of such applications expeditiously, and in any event within one year of notice being served under Section 34(5) of the Act.

B. Section 48 (Part II): Conditions for Enforcement of Foreign Awards

Part II of the Act implements India's obligations under the New York Convention and governs the recognition and enforcement of foreign awards. Section 48 sets out the grounds on which a party may resist enforcement. These grounds are deliberately narrow and mirror the text of Article V of the New York Convention:

Incapacity of a party to the arbitration agreement; Invalidity of the arbitration agreement under its governing law; Lack of proper notice of the arbitral proceedings; The award dealing with matters outside the scope of submission to arbitration; Improper composition of the arbitral tribunal; and Violation of the "public policy of India."

Importantly, the public policy exception under Section 48 is interpreted far more narrowly than its counterpart under Section 34. An enforcement court is not empowered to re-examine the merits of the award, correct errors of fact or law, or substitute its judgment for that of the arbitral tribunal.

III. Landmark Jurisprudence of the Supreme Court of India

A. Bharat Aluminium Co. v. Kaiser Aluminium Technical Services Inc. (BALCO) (2012)

BALCO is the bedrock of modern Indian arbitration law. Before this decision, Indian courts had interpreted Part I of the Act as applying to all arbitrations with a connection to India, irrespective of their seat, a position that facilitated significant judicial interference with foreign-seated arbitrations.

A five-judge Constitution Bench of the Supreme Court prospectively overruled that interpretation. It held, unequivocally, that Part I of the Act applies only to arbitrations seated in India. Part II governing the enforcement of foreign awards operates as a separate, self-contained regime. The two parts do not intersect. The consequence of this ruling was categorical: Section 34 cannot be invoked to challenge a foreign award.

B. Shri Lal Mahal Ltd. v. Progetto Grano Spa (2013)

Building on BALCO, the Supreme Court in Shri Lal Mahal addressed a question that had generated considerable uncertainty: Is the scope of "public policy" under Section 48 coextensive with its scope under Section 34?

The Court answered in the negative. It held that the public policy exception in Section 48 is significantly narrower in scope than under Section 34. An enforcement court cannot refuse recognition of a foreign award simply because the arbitrator committed an error of law or fact. The Court made clear that Indian courts are not entitled to take a "second look" at the merits of a foreign award under the guise of a public policy review. Only a violation of the most basic notions of morality or justice could justify non-enforcement.

C. Vijay Karia v. Prysmian Cavi E Sistemi SRL (2020)

The Supreme Court's decision in Vijay Karia is perhaps the most forceful judicial statement of India's pro-enforcement stance. The Court penalised attempts to resist foreign awards through dilatory and frivolous litigation, affirming that an enforcement court under Section 48 does not function as an appellate court.

In a passage that has since become widely cited in arbitration practice, the Court observed that parties often engage in speculative litigation against foreign awards in the hope that some objection, however tenuous, may find traction. The Court set an extremely high threshold for refusing enforcement, underscoring that the pro-enforcement bias of the New York Convention is not merely aspirational it is the operative standard in Indian courts.

D. Government of India v. Vedanta Limited (2020)

In Vedanta, The Supreme Court reiterated that an enforcement court under Section 48 cannot re-assess or re-evaluate the evidence considered by the arbitral tribunal. The award in question arose from a complex production-sharing contract in the energy sector, and the Court was asked to refuse enforcement on public policy grounds.

The Court declined, holding that a foreign award may only be refused enforcement where it "shocks the conscience of the court" or violates the fundamental policy of Indian law. An erroneous interpretation of a contract by the tribunal even one with which the court might disagree, is not a ground for refusing enforcement. The judgment reinforced the principle that India's enforcement courts are gatekeepers, not appellate fora.

IV. Practical Implications for Parties and Practitioners

The cumulative effect of the statutory scheme and judicial precedent is clear. A party dealing with a foreign arbitral award in India must navigate the following framework:

For the award-creditor: Enforcement is the correct pathway. An application under Section 47 and Section 49 of the Act (read with Section 48) is the mechanism to convert a foreign award into an executable decree. Courts will presume in favour of enforcement; the burden lies on the party resisting.

For the award-debtor: Section 48 provides the exhaustive and exclusive catalogue of defences. An attempt to invoke Section 34 to set aside the award will be dismissed at the threshold for want of jurisdiction. Meritless opposition to enforcement also risks attracting costs, as the courts have repeatedly signalled their impatience with dilatory tactics in this domain.

For corporate counsel: Seat selection in arbitration agreements is a strategic decision with lasting consequences. Choosing a seat outside India does not insulate an award from scrutiny altogether, but it does ensure that any challenge to the award's validity is heard in the jurisdiction of the seat, not in India. Indian courts will only be involved at the enforcement stage, and their role at that stage is deliberately constrained.

V. Conclusion

The jurisprudential journey from the pre-BALCO era to the present reflects a conscious effort by India's courts to align domestic arbitration law with international best practices. The distinction between setting aside and refusing enforcement is not a technical formality it is the cornerstone of a regime that respects party autonomy, upholds finality of awards, and honours India's treaty obligations under the New York Convention.

For practitioners and parties alike, the message is unambiguous: when a foreign award arrives at Indian shores, the question is not whether it can be undone, but only whether the narrow conditions for non-enforcement have been met. And the Supreme Court of India has made abundantly clear that those conditions will be construed with considerable strictness.`,
  },
  {
    id: 'rcb-mega-acquisition',
    title: 'The ₹16,600 Crore Game Changer: Unpacking the Legal Architecture of the RCB Mega-Acquisition',
    summary: 'Behind the most expensive franchise transaction in IPL history lies a rigorous multi-layered legal process drawing on corporate law, securities regulation, competition policy, and FEMA.',
    createdAt: '2026-08-05',
    author: 'aawath',
    content: `When the final whistle blew on United Spirits Limited's ownership of Royal Challengers Bengaluru (RCB), it was not merely a cricket story. It was a landmark corporate event, one that instantly became the most expensive franchise transaction in Indian Premier League (IPL) history. At a staggering ₹16,600 crore (approximately USD 1.78 billion), the sale of RCB to a consortium led by the Aditya Birla Group, The Times of India Group, Bolt Ventures, and Blackstone has redrawn the boundaries of sports commerce in India.

But behind the spectacle of a high-profile ownership change lies a rigorous and multi-layered legal process, one that draws on corporate law, securities regulation, competition policy, and foreign exchange management. For legal practitioners, corporate counsels, and business professionals, this deal is nothing short of a masterclass in Indian M&A law in action.

I. The Deal Structure: A Share Purchase, Not a Merger

At its core, this transaction is a 100% share acquisition. The Birla consortium purchased the entirety of Royal Challengers Sports Private Limited, the entity that owns and operates both the men's and women's RCB franchises. This is a critical structural distinction. Because the transaction involves a straightforward transfer of shares (rather than an amalgamation, demerger, or court-approved scheme), it is governed primarily by Section 56 of the Companies Act, 2013, which mandates the formal registration of share transfers, and by Section 179/180, which requires the Board of Directors of United Spirits Limited (a listed company) to formally pass resolutions authorising the disposal of a material subsidiary.

The Share Purchase Agreement (SPA), the cornerstone document of any such deal, would have defined every material term: the purchase price, representations and warranties given by the seller, indemnities against undisclosed liabilities, conditions precedent to closing, and post-closing obligations. Given that this was an all-cash transaction, the financial mechanics are relatively clean; however, the regulatory conditions precedent made this anything but simple.

II. SEBI Obligations: Transparency as a Legal Duty

United Spirits Limited (USL) is a publicly listed company on both the BSE and NSE. The sale of RCB, an entity that constitutes a significant operational and brand asset for the group, squarely falls within the ambit of Regulation 30 of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015.

This regulation obligates listed companies to immediately disclose any material event or information to the stock exchanges, with no room for discretionary delay. The rationale is to protect retail investors and ensure market integrity. A listed company cannot allow its promoters or institutional shareholders to act on price-sensitive information before it reaches the public domain. Non-compliance with Regulation 30 can attract severe penalties from SEBI, including fines and adjudication proceedings.

Diageo, USL's parent and the global spirits major, would also have been required to ensure that its own disclosures in international markets, particularly the London Stock Exchange, where Diageo plc is listed, aligned with the Indian disclosures to prevent any asymmetric information flow.

III. The CCI Clearance: Competition Law at the Forefront

One of the most consequential regulatory hurdles in any large acquisition in India is the mandatory notification to the Competition Commission of India (CCI) under Section 5 of the Competition Act, 2002. Section 5 triggers a filing obligation when the target company, the acquirer, or the combined entity crosses prescribed thresholds of assets or turnover thresholds that this ₹16,600 crore transaction surpasses decisively.

Under Section 6 of the Competition Act, no combination can take effect until the CCI either approves it or the statutory review period lapses. The Commission's review focuses on whether the combination would cause an 'Appreciable Adverse Effect on Competition' (AAEC) in any relevant market. In the RCB case, the CCI's scrutiny would have been directed at several overlapping markets: sports content broadcasting, digital media distribution, sports marketing and sponsorships, and large-scale event management.

The presence of The Times of India Group, one of India's most dominant media conglomerates, in the acquiring consortium was particularly likely to draw the Commission's attention. The convergence of media ownership with a top-tier cricket franchise raises pointed questions about cross-market leverage: could the Times Group give RCB's commercial content preferential placement across its newspapers, streaming platforms, and news channels in a manner that distorts the advertising market? The CCI would have needed to satisfy itself that adequate structural safeguards exist before granting clearance.

IV. FEMA and the Foreign Investment Dimension

The participation of Blackstone and Bolt Ventures, both foreign entities, introduces a significant Foreign Direct Investment (FDI) dimension governed by the Foreign Exchange Management Act (FEMA), 1999 and the RBI's Master Directions on Foreign Investment.

Under India's FDI policy, sports infrastructure and franchises fall under a sector that permits 100% FDI under the automatic route, subject to compliance with pricing guidelines and sectoral conditions. However, the foreign investors' capital must be remitted through approved banking channels, and the pricing of the shares transferred to foreign entities must comply with the internationally accepted pricing methodology (typically a Discounted Cash Flow or comparable market transaction approach) to satisfy FEMA's fair value requirements.

Any deviation from arm's-length pricing in transactions involving foreign acquirers can invite RBI scrutiny and, in serious cases, attract compounding proceedings under FEMA. The involvement of marquee investors like Blackstone with significant global regulatory experience suggests the transaction would have been structured with meticulous attention to these requirements.

V. BCCI Approval: The Lex Sportiva of IPL Ownership

What distinguishes sports franchise M&A from a conventional corporate buyout is the requirement for approval from the sport's governing body. The Board of Control for Cricket in India (BCCI) and the IPL Governing Council hold ultimate veto power over any change in franchise ownership.

The BCCI's approval process involves scrutinising the financial standing and integrity of proposed owners, reviewing whether the incoming owners meet the 'fit and proper' criteria under IPL operational guidelines, and ensuring that no single entity has cross-ownership interests in multiple franchises (a rule designed to prevent conflicts of interest). The BCCI can, in principle, reject a buyer, even one that has signed a legally binding SPA, if the proposed ownership does not meet these standards. This creates an unusual legal dynamic where a private sporting body exercises quasi-regulatory power over what would otherwise be a purely commercial transaction.

VI. Tax Considerations: Valuation and Capital Gains

The transaction also raises important direct tax considerations. Since Royal Challengers Sports Private Limited is an unlisted private company, the transfer of its shares attracts capital gains tax in the hands of the seller (USL/Diageo). Under the Income Tax Act, 1961, Section 50CA ensures that if the actual sale consideration is less than the Fair Market Value (FMV) of the unlisted shares (computed as per Rule 11UA), the FMV is deemed to be the sale consideration for the purposes of computing capital gains. The buyer's side must equally ensure that the purchase price does not attract the mischief of Section 56(2)(x), which taxes the receipt of shares below FMV as income from other sources. At ₹16,600 crore, both parties had strong incentives to ensure robust and defensible valuation documentation.

VII. Broader Significance: A New Chapter for Sports M&A in India

The RCB acquisition does not stand in isolation. It is part of a broader wave of institutional capital flooding Indian sport. The Gujarat Titans and Lucknow Super Giants franchises were acquired in 2021 for ₹5,625 crore and ₹7,090 crore, respectively, and valuations have only surged since. The entry of blue-chip private equity firms (Blackstone, CVC Capital Partners), global sports investors (David Blitzer's Bolt Ventures), and diversified Indian conglomerates (Aditya Birla Group, RPSG Group) signals the coming of age of sports as a distinct and institutionalised asset class in India.

For legal professionals, this evolution presents both opportunity and responsibility. The frameworks governing these transactions, the Companies Act, Competition Act, FEMA, SEBI LODR, BCCI guidelines, and Income Tax Act, do not operate in silos. They create a complex, interlocking web of obligations that demands multi-disciplinary legal expertise. The day is not far when Indian law firms will require dedicated Sports M&A practices, just as their counterparts in the United Kingdom and the United States have done for decades.

Conclusion

The RCB deal is more than a cricket club changing hands. It is a mirror held up to the sophistication of India's corporate legal landscape, one that reflects the country's ambitions as a global destination for institutional sports investment. As valuations continue to soar and the appetite of global capital for Indian sport shows no signs of abating, the legal and regulatory frameworks governing these transactions will be tested, refined, and inevitably, transformed.

For those of us in the legal profession, that is perhaps the most electrifying part of this story.`,
  },
];
