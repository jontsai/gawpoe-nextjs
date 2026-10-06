import { createHash } from "node:crypto";
export function decodePublicEmails($) {
  $("[data-cfemail]").each((_, el) => {
    const e = $(el),
      hex = e.attr("data-cfemail"),
      key = parseInt(hex.slice(0, 2), 16);
    let text = "";
    for (let i = 2; i < hex.length; i += 2)
      text += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    if (el.name === "a") e.attr("href", "mailto:" + text);
    else if (
      e.closest("a").attr("href")?.includes("/cdn-cgi/l/email-protection")
    )
      e.closest("a").attr("href", "mailto:" + text);
    e.text(text).removeAttr("data-cfemail").removeClass("__cf_email__");
  });
}
export function primaryContract($) {
  const content = $(".wp-site-blocks").clone();
  content.find("header,footer,script,style,template,.ti-widget").remove();
  const text = content.text().replace(/\s+/g, " ").trim();
  return {
    sourceTextHash: createHash("sha256").update(text).digest("hex"),
    sourceTextLength: text.length,
    sourceLinks: content
      .find("a[href]")
      .map((_, e) => $(e).attr("href"))
      .get(),
  };
}
