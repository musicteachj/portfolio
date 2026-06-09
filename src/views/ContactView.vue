<template>
  <div class="contact-page">
    <v-container>
      <!-- Header -->
      <div class="section-head mb-12">
        <p class="eyebrow mb-2">Contact</p>
        <h1 class="page-title">Let's work together</h1>
        <div class="accent-rule is-visible"></div>
        <p class="page-subtitle">
          Get in touch about collaborations, ideas, or just to say hello — I read every message.
        </p>
      </div>

      <v-row>
        <!-- Contact Info -->
        <v-col cols="12" md="5">
          <div class="contact-info">
            <p class="contact-info__lead">
              Always up for a good conversation — tell me what you're building and let's talk.
            </p>

            <a href="mailto:jameslittlefield3@gmail.com" class="contact-row">
              <span class="contact-row__icon"><v-icon size="20">mdi-email-outline</v-icon></span>
              <span>
                <span class="contact-row__label">Email</span>
                <span class="contact-row__value">jameslittlefield3@gmail.com</span>
              </span>
            </a>

            <div class="contact-row">
              <span class="contact-row__icon"
                ><v-icon size="20">mdi-map-marker-outline</v-icon></span
              >
              <span>
                <span class="contact-row__label">Location</span>
                <span class="contact-row__value">Atlanta, GA</span>
              </span>
            </div>

            <div class="contact-socials">
              <a
                href="https://www.linkedin.com/in/james-littlefield-93037713b/"
                target="_blank"
                rel="noopener"
                class="contact-social"
                aria-label="LinkedIn"
              >
                <v-icon>mdi-linkedin</v-icon>
              </a>
              <a
                href="https://github.com/musicteachj"
                target="_blank"
                rel="noopener"
                class="contact-social"
                aria-label="GitHub"
              >
                <v-icon>mdi-github</v-icon>
              </a>
            </div>
          </div>
        </v-col>

        <!-- Contact Form -->
        <v-col cols="12" md="7">
          <v-card class="contact-card">
            <v-form ref="formRef" @submit.prevent="submitForm" v-model="formValid">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.name"
                    label="Name"
                    required
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    type="email"
                    required
                    :rules="emailRules"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="form.subject"
                label="Subject"
                required
                :rules="subjectRules"
                class="mb-1"
              ></v-text-field>

              <v-textarea
                v-model="form.message"
                label="Message"
                rows="6"
                required
                :rules="messageRules"
                class="mb-3"
              ></v-textarea>

              <v-btn
                type="submit"
                color="accent"
                size="large"
                block
                class="text-none"
                :loading="submitting"
                :disabled="!formValid"
                prepend-icon="mdi-send-outline"
              >
                Send message
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import type { ContactForm } from '@/types'

import emailjs from 'emailjs-com'

const snackbar = useSnackbarStore()

const submitting = ref(false)
const formValid = ref(false)
const formRef = ref()

const form = ref<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => (v && v.length <= 30) || 'Name must be 30 characters or less',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => (v && v.length <= 30) || 'Email must be 30 characters or less',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const subjectRules = [
  (v: string) => !!v || 'Subject is required',
  (v: string) => (v && v.length <= 30) || 'Subject must be 30 characters or less',
]

const messageRules = [
  (v: string) => !!v || 'Message is required',
  (v: string) => (v && v.length <= 1000) || 'Message must be 1000 characters or less',
]

const submitForm = async (): Promise<void> => {
  // Validate form before submission
  const { valid } = await formRef.value.validate()

  if (!valid) {
    snackbar.error('Please fix the form errors before submitting.')
    return
  }

  submitting.value = true

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        name: form.value.name,
        email: form.value.email,
        subject: form.value.subject,
        message: form.value.message,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    )

    snackbar.success('Message sent successfully!')
    resetForm()
  } catch (error) {
    console.error(error)
    snackbar.error('Failed to send message. Please try again.')
  } finally {
    submitting.value = false
  }
}

const resetForm = (): void => {
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
  // Reset form validation state
  formRef.value?.resetValidation()
}
</script>

<style scoped>
.contact-page {
  padding: var(--section-py) 0;
  min-height: 100vh;
}

.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.page-subtitle {
  margin-top: 18px;
  font-size: 1.05rem;
  color: rgb(var(--v-theme-secondary));
  max-width: 520px;
}

/* Contact info column */
.contact-info__lead {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 32px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  text-decoration: none;
  color: inherit;
}

.contact-row__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  color: rgb(var(--v-theme-accent));
  background: rgba(var(--v-theme-accent), 0.1);
  transition: transform 0.22s var(--ease-out);
}

.contact-row:hover .contact-row__icon {
  transform: translateY(-2px);
}

.contact-row__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--v-theme-on-surface-muted, #64748b);
}

.contact-row__value {
  display: block;
  font-size: 1rem;
  color: rgb(var(--v-theme-primary));
}

.contact-socials {
  display: flex;
  gap: 10px;
  margin-top: 28px;
}

.contact-social {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  color: rgb(var(--v-theme-secondary));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  transition: all 0.22s var(--ease-out);
}

.contact-social:hover {
  color: rgb(var(--v-theme-accent));
  border-color: rgb(var(--v-theme-accent));
  transform: translateY(-3px);
}

/* Form card */
.contact-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--v-theme-border, rgba(148, 163, 184, 0.25));
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-light);
}

@media (max-width: 960px) {
  .contact-page {
    padding: var(--section-py-mobile) 0;
  }

  .contact-card {
    margin-top: 12px;
  }
}
</style>
