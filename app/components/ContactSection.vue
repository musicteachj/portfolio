<script setup lang="ts">
import { site } from '~/data/site'
</script>

<template>
  <section id="contact" class="contact" aria-labelledby="contact-h">
    <div class="wrap contact-grid">
      <div>
        <h2 id="contact-h" tabindex="-1">Contact</h2>
        <p>Send a message here, or reach me directly.</p>
        <ul class="direct">
          <li><a href="/contact">Email</a></li>
          <li><a :href="site.linkedinUrl">LinkedIn</a></li>
          <li><a :href="site.githubUrl">GitHub</a></li>
          <li><a :href="site.resumePath">Résumé (PDF)</a></li>
        </ul>
      </div>
      <form id="cform" class="cform" novalidate @submit.prevent>
        <div class="f-row">
          <div class="field">
            <label for="f-name">Name</label>
            <input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err">
            <p id="f-name-err" class="f-err"></p>
          </div>
          <div class="field">
            <label for="f-email">Email</label>
            <input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-err">
            <p id="f-email-err" class="f-err"></p>
          </div>
        </div>
        <div class="field">
          <label for="f-subject">Subject</label>
          <input id="f-subject" name="subject" type="text" required aria-describedby="f-subject-err">
          <p id="f-subject-err" class="f-err"></p>
        </div>
        <div class="field">
          <label for="f-message">Message</label>
          <textarea id="f-message" name="message" rows="5" required aria-describedby="f-message-err"></textarea>
          <p id="f-message-err" class="f-err"></p>
        </div>
        <div class="f-foot">
          <button id="f-submit" type="submit" class="btn btn--primary">Send message</button>
        </div>
        <div id="f-status" class="f-status" role="status" aria-live="polite"></div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact { padding: var(--s-8) 0; border-top: 1px solid var(--line); background: var(--surface); scroll-margin-top: 0; }
.contact-grid { display: grid; grid-template-columns: 1fr; gap: var(--s-6); }
@media (min-width: 900px) { .contact-grid { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: var(--s-8); align-items: start; } }
.contact h2 { font-size: var(--t-h2); letter-spacing: -0.028em; }
.contact-grid > div > p { margin-top: var(--s-3); color: var(--ink-2); }
.direct { list-style: none; margin-top: var(--s-5); border-top: 2px solid var(--mark); }
@media (min-width: 600px) and (max-width: 899px) { .direct { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--s-6); } }
.direct li { border-bottom: 1px solid var(--line); }
.direct a { display: flex; align-items: center; min-height: 48px; font-weight: 500; text-decoration: none; }
.direct a:hover { text-decoration: underline; }
.cform { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-stage); padding: clamp(16px, 3vw, 32px); box-shadow: inset 0 3px 0 var(--soft); min-width: 0; }
.f-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); }
@media (max-width: 559px) { .f-row { grid-template-columns: 1fr; gap: 0; } }
.field { margin-bottom: var(--s-4); }
.field label { display: block; font-size: var(--t-small); font-weight: 500; color: var(--ink); margin-bottom: 6px; }
.field input, .field textarea {
  display: block; width: 100%; font: 400 1rem/1.5 var(--font-sans); color: var(--ink);
  background: var(--surface); border: 1px solid var(--field-border); border-radius: var(--r-ctl); padding: 10px 12px; min-height: var(--tap);
}
.field textarea { resize: vertical; min-height: 128px; }
.field input:hover, .field textarea:hover { border-color: var(--ink-2); }
.field input:focus-visible, .field textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); border-radius: var(--r-ctl); }
.field [aria-invalid="true"] { border-color: var(--error); box-shadow: inset 3px 0 0 var(--error); }
.cform .f-err { margin-top: 6px; font-size: 0.8125rem; color: var(--error); }
.cform .f-err:empty { display: none; }
.f-foot { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-3) var(--s-5); }
.f-status:empty { display: none; }
.f-status { margin-top: var(--s-4); padding: 12px 14px; border-radius: var(--r-ctl); font-size: var(--t-small); font-weight: 500; }
.f-status.ok { background: var(--pass-soft); color: var(--pass); box-shadow: inset 3px 0 0 var(--pass); }
.f-status.bad { background: var(--error-soft); color: var(--error); box-shadow: inset 3px 0 0 var(--error); }
</style>
