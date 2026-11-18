<script setup lang="ts">
const config = useRuntimeConfig().public.emailjs
const nuxtApp = useNuxtApp()

const fields = reactive<ContactFields>({ name: '', email: '', subject: '', message: '' })
const errors = reactive<ContactFields>({ name: '', email: '', subject: '', message: '' })
const honeypot = ref('')
const submitted = ref(false)
const sending = ref(false)
const SENDING_MIN_MS = 600
const status = reactive({ kind: '', text: '' })

function fieldValue(id: string): string {
  return (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? ''
}

// Hydration sets each field from this state, which would wipe anything typed or autofilled into
// the server-rendered form before the page hydrated. So copy the fields into the state first.
// Copy the honeypot as well, so a bot that fills it early is still caught. The fields use
// v-model, not :value, because Vue's dev build reports a bound :value that differs from the
// server HTML as a hydration mismatch.
onBeforeMount(() => {
  if (!nuxtApp.isHydrating) return
  for (const key of CONTACT_FIELD_KEYS) fields[key] = fieldValue(`f-${key}`)
  honeypot.value = fieldValue('f-hp')
})

function check(key: ContactFieldKey): boolean {
  errors[key] = fieldError(key, fields[key])
  return !errors[key]
}

// v-model stores the new value first (its listener is attached before @input's).
function onInput(key: ContactFieldKey) {
  if (errors[key]) check(key)
}

function onBlur(key: ContactFieldKey) {
  if (submitted.value || fields[key].trim()) check(key)
}

function reset() {
  for (const key of CONTACT_FIELD_KEYS) {
    fields[key] = ''
    errors[key] = ''
  }
  honeypot.value = ''
  submitted.value = false
  status.kind = 'ok'
  status.text = "Message sent. I'll reply to your email."
}

async function onSubmit() {
  if (sending.value) return
  submitted.value = true
  status.kind = ''
  status.text = ''
  let firstInvalid: ContactFieldKey | undefined
  for (const key of CONTACT_FIELD_KEYS) {
    if (!check(key) && !firstInvalid) firstInvalid = key
  }
  if (firstInvalid) {
    // Render the errors first, so a screen reader meets the field's aria-invalid and error text
    // when focus lands.
    await nextTick()
    document.getElementById(`f-${firstInvalid}`)?.focus()
    return
  }
  // A filled honeypot means a bot. Skip the send and show the same success a person sees.
  if (honeypot.value) {
    reset()
    return
  }
  sending.value = true
  // A fast reply would flash "Sending..." too briefly to see, so the sending state lasts at
  // least this long. A slower reply adds no wait.
  const shown = new Promise((resolve) => setTimeout(resolve, SENDING_MIN_MS))
  try {
    // Pass a plain copy: reset() clears the reactive state, which must not reach the sender.
    await sendContactMessage({ ...fields }, config)
    await shown
    reset()
  }
  catch (error) {
    console.warn('Contact form send failed', error)
    await shown
    status.kind = 'bad'
    status.text = "Your message didn't send. Check your connection and try again, or email me directly."
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <form id="cform" class="cform" method="post" novalidate @submit.prevent="onSubmit">
    <div class="f-row">
      <div class="field">
        <label for="f-name">Name</label>
        <input id="f-name" v-model="fields.name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err" :aria-invalid="errors.name ? 'true' : undefined" @input="onInput('name')" @blur="onBlur('name')">
        <p id="f-name-err" class="f-err">{{ errors.name }}</p>
      </div>
      <div class="field">
        <label for="f-email">Email</label>
        <input id="f-email" v-model="fields.email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-err" :aria-invalid="errors.email ? 'true' : undefined" @input="onInput('email')" @blur="onBlur('email')">
        <p id="f-email-err" class="f-err">{{ errors.email }}</p>
      </div>
    </div>
    <div class="field">
      <label for="f-subject">Subject</label>
      <input id="f-subject" v-model="fields.subject" name="subject" type="text" required aria-describedby="f-subject-err" :aria-invalid="errors.subject ? 'true' : undefined" @input="onInput('subject')" @blur="onBlur('subject')">
      <p id="f-subject-err" class="f-err">{{ errors.subject }}</p>
    </div>
    <div class="field">
      <label for="f-message">Message</label>
      <textarea id="f-message" v-model="fields.message" name="message" rows="5" required aria-describedby="f-message-err" :aria-invalid="errors.message ? 'true' : undefined" @input="onInput('message')" @blur="onBlur('message')"></textarea>
      <p id="f-message-err" class="f-err">{{ errors.message }}</p>
    </div>
    <div class="hp" aria-hidden="true">
      <label for="f-hp">Leave this field empty</label>
      <input id="f-hp" v-model="honeypot" name="hp" type="text" tabindex="-1" autocomplete="off">
    </div>
    <div class="f-foot">
      <button id="f-submit" type="submit" class="btn btn--primary" :aria-disabled="sending ? 'true' : undefined"><span v-if="sending" class="spinner" aria-hidden="true" />{{ sending ? 'Sending...' : 'Send message' }}</button>
    </div>
    <div id="f-status" class="f-status" :class="status.kind" role="status" aria-live="polite">{{ status.text }}</div>
  </form>
</template>

<style scoped>
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
/* While sending (v11): dimmed with a busy cursor, still focusable. */
.btn[aria-disabled="true"] { opacity: .8; cursor: progress; }
/* A small ring beside "Sending...". base.css stops it under reduced motion, leaving a still ring. */
.spinner { width: 14px; height: 14px; flex: none; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* Collapsed, not display: none, so the live region stays in the accessibility tree while empty. */
.f-status:empty { margin: 0; padding: 0; }
.f-status { margin-top: var(--s-4); padding: 12px 14px; border-radius: var(--r-ctl); font-size: var(--t-small); font-weight: 500; }
.f-status.ok { background: var(--pass-soft); color: var(--pass); box-shadow: inset 3px 0 0 var(--pass); }
.f-status.bad { background: var(--error-soft); color: var(--error); box-shadow: inset 3px 0 0 var(--error); }
.hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
</style>
