<template>
  <div class="contact-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="text-center mb-8">
            <h1 class="text-h2 font-weight-bold mb-4">Contact Me</h1>
            <p class="text-h6" style="opacity: 0.8">
              Get in touch for opportunities and collaborations
            </p>
          </div>
        </v-col>

        <v-col cols="12" md="8" offset-md="2">
          <v-card elevation="8" class="pa-8">
            <v-row>
              <!-- Contact Info -->
              <v-col cols="12" md="6">
                <h3 class="text-h5 mb-4">Let's work together!</h3>
                <p class="text-body-1 mb-6">
                  I'm always interested in new opportunities and exciting projects. Feel free to
                  reach out if you'd like to discuss potential collaborations.
                </p>

                <div class="contact-info">
                  <div class="d-flex align-center mb-4">
                    <v-icon color="primary" class="mr-4">mdi-email</v-icon>
                    <span class="text-body-1">jameslittlefield3@gmail.com</span>
                  </div>
                  <div class="d-flex align-center mb-6">
                    <v-icon color="primary" class="mr-4">mdi-map-marker</v-icon>
                    <span class="text-body-1">Atlanta, Ga</span>
                  </div>
                </div>

                <!-- Social Links -->
                <div class="d-flex ga-3">
                  <v-btn
                    href="https://www.linkedin.com/in/james-littlefield-93037713b/"
                    target="_blank"
                    icon="mdi-linkedin"
                    color="primary"
                    variant="outlined"
                  ></v-btn>
                  <v-btn
                    href="https://github.com/musicteachj"
                    target="_blank"
                    icon="mdi-github"
                    color="primary"
                    variant="outlined"
                  ></v-btn>
                </div>
              </v-col>

              <!-- Contact Form -->
              <v-col cols="12" md="6">
                <v-form ref="formRef" @submit.prevent="submitForm" v-model="formValid">
                  <v-text-field
                    v-model="form.name"
                    label="Name"
                    variant="outlined"
                    required
                    :rules="nameRules"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    required
                    :rules="emailRules"
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="form.subject"
                    label="Subject"
                    variant="outlined"
                    required
                    :rules="subjectRules"
                    class="mb-3"
                  ></v-text-field>

                  <v-textarea
                    v-model="form.message"
                    label="Message"
                    variant="outlined"
                    rows="6"
                    required
                    :rules="messageRules"
                    class="mb-4"
                  ></v-textarea>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="submitting"
                    :disabled="!formValid"
                  >
                    Send Message
                  </v-btn>
                </v-form>
              </v-col>
            </v-row>

            <!-- Back Button -->
            <div class="text-center mt-8">
              <v-btn
                to="/"
                :color="isDark ? 'primary' : 'secondary'"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
              >
                Back to Home
              </v-btn>
            </div>
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
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')

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
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    snackbar.success('Message sent successfully!')
    resetForm()
  } catch (error) {
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
  padding: 80px 0;
  min-height: 100vh;
}
</style>
