# The framework

The intellectual core. Mirrors L2BEAT's approach (rate each chain across
independent dimensions, review each as if the others were green, show the detail
behind every rating) but for **financial-crime safety** instead of security. Defined
as data in `content/methodology.ts`; the in-app Methodology view renders it.

## The seven dimensions

| Dimension | The question | Clear (green) | Elevated (red) |
|---|---|---|---|
| **Traceability** | Can flows be followed? | Transparent, no anonymity tech | Privacy by default (ring sigs / shielded pools) |
| **Analytics coverage** | Do Chainalysis / TRM / Elliptic support it? | Covered, mature attribution | Unsupported, tracing infeasible |
| **Illicit exposure** | How concentrated is illicit / sanctioned activity? | Low share vs volume | Disproportionate / blacklisted-address density |
| **Asset controls** | Can assets be frozen / seized / permissioned? | Mature native + token controls, real precedent | No practical controls, immutable |
| **Travel Rule & identity** | Can identity be attached? | Broad VASP + Travel Rule + identity tooling | None / hostile to identity |
| **Accountability** | Reachable operator, clear jurisdiction? | Accountable, clear jurisdiction, no sanctions nexus | Anonymous / ungoverned / sanctions nexus |
| **Adverse media** | What does sustained credible reporting say about the network and its people? | No sustained adverse coverage | Sustained current reporting tying the network or its principals to financial crime |

Each is rated Clear / Caution / Elevated, normalised so green is always lower
concern.

**Adverse media (added 18 Aug 2026, prompted by user feedback)** is deliberately
distinct from its neighbours: illicit exposure measures activity ON the chain;
accountability asks whether an operator can be REACHED; adverse media asks what
credible reporting SAYS about the network and the organisations and people
behind it. Its weight is modest (about a tenth of the balanced grade) so it
informs a grade without outweighing visibility and control.

## Band derivation

The band rolls up from the model's grade (`lib/model.ts` `bandFromGrade`):
grades A and B are **Established**, C and D **Conditional**, E **High-risk**.
The visibility cap means any chain whose Traceability or Analytics coverage is
Elevated scores at least 66 and lands in E, so "cannot be seen or screened"
still forces High-risk whatever the other factors say. (An earlier version of
this file described a hand-derived band with a caution count; the band has been
model-derived since the quantitative model arrived, and this section now
matches the code.)

## The quantitative model (`lib/model.ts`)

The band and score are produced by a transparent, **product-aware** model with no
hand adjustment. Each factor's level maps to a severity (`clear 0 / caution 50 / elevated 100`).
A weight vector, chosen by the **deployment profile** (6 products × 3 customer
types, `PRODUCT_WEIGHTS` × `CUSTOMER_MULT`, renormalised by `resolveWeights`),
combines the severities into a 0–100 score:

```
score = Σ (severity_factor × weight_factor)   // 0 = lowest risk
```

Two **hard caps** stop a weighting from hiding a critical failure:
- **Visibility failure**: traceability or coverage Elevated → score floored to 66 (grade E).
- **Compounding**: two or more Elevated factors → floored to 46 (≥ grade D).

The capped score maps to a **letter grade A to E** (Strong / Good / Mixed / Weak /
Poor) at fixed thresholds in `gradeFromScore`: A below 12, B from 12 to 25, C from 26 to 43,
D from 44 to 61 and E from 62. The grade rolls up into the `Band` (A, B Established, C, D
Conditional, E High-risk). `scoreChain(chain, profile)` returns the weights, the
per-factor contributions, the raw and final scores, any cap, the grade, and the
ranked **key risk drivers**, all shown on the chain page. `deriveBand` /
`concernIndex` / `byRisk` in `rating.ts` are thin profile-aware wrappers.

The seven factors also roll up into four **pillars** for the breakdown views (`PILLARS` in
`lib/model.ts`): Visibility (traceability and analytics coverage), Exposure (illicit exposure),
Control (asset controls and Travel Rule and identity) and Integrity (accountability and adverse media).

Three further fields on each chain change how a rating is read, and none of them changes the score.
The `basis` of a rating is `observed` by default, or `no-record` where there is too little history
to say, so that a clear level reads as an absence of evidence and not as measured safety. The
`exposure` field gives the footprint tier (mainstream, emerging, niche or restricted) with the
evidence for it, which shows how likely a regulated firm is to meet the chain and sits off the risk
palette. The required `residual` note states in one line what remains after the seven factors,
because seven clear ratings mean only that no material gap was found on those questions.

Because the model is profile-aware, a chain's grade **changes with what you are
deploying** (a stablecoin payment product weights controls and illicit exposure;
a custody product weights visibility). The Overview and chain page carry a
segmentation control that re-scores and re-ranks live.

The severities are deliberately ordinal (three levels), so the model does not
invent false precision; the nuance is in the weighting and the caps.

## Why this matters

The framework encodes the thesis. Under the default balanced profile, the transparent majors (Bitcoin, Ethereum,
the large EVM L2s such as Base, Arbitrum One and OP Mainnet, payment ledgers) come out **Established** because you can
see, screen and control them. Privacy-by-default chains come out **High-risk**
because you cannot. "Public equals wild west" is exactly the misconception the ratings
are built to correct.
