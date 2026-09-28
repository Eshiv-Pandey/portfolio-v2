/**
 * Site-level constants shared by the metadata exports.
 *
 * `TITLE_TEMPLATE` lives here rather than only in the root layout because a
 * nested layout that sets a plain string `title` resolves it as
 * `{ absolute, template: null }` — which clears the inherited template for that
 * segment's children. Any layout that wants its children to keep the suffix has
 * to restate the template, so there needs to be one copy to restate.
 */
export const SITE_NAME = "Eshiv Pandey";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://eshivpandey18.vercel.app";

export const TITLE_TEMPLATE = `%s · ${SITE_NAME}`;

export const SITE_DESCRIPTION =
  "Full stack developer and open source contributor. CNCF HAMi member, building systems from B+Tree storage engines to multi-model AI workspaces.";

/**
 * Résumé link. This points at a Google Drive file you own, so you can update
 * the résumé any time by replacing the file in Drive — the site always links to
 * the latest version, no redeploy needed. To swap it for a different document,
 * change only this URL.
 */
export const RESUME_URL =
  "https://drive.google.com/file/d/1nBRrvWMElz_L-EcyfI4LpfLVlxd0Uu-i/view?usp=sharing";
