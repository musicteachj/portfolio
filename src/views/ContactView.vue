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
                <v-form @submit.prevent="submitForm">
                  <v-text-field
                    v-model="form.name"
                    label="Name"
                    variant="outlined"
                    required
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    required
                    class="mb-3"
                  ></v-text-field>

                  <v-text-field
                    v-model="form.subject"
                    label="Subject"
                    variant="outlined"
                    required
                    class="mb-3"
                  ></v-text-field>

                  <v-textarea
                    v-model="form.message"
                    label="Message"
                    variant="outlined"
                    rows="4"
                    required
                    class="mb-4"
                  ></v-textarea>

                  <v-btn type="submit" color="primary" size="large" block :loading="submitting">
                    Send Message
                  </v-btn>
                </v-form>
              </v-col>
            </v-row>

            <!-- Back Button -->
            <div class="text-center mt-8">
              <v-btn to="/" color="secondary" variant="outlined" prepend-icon="mdi-arrow-left">
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

const snackbar = useSnackbarStore()

const submitting = ref(false)
const form = ref<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitForm = async (): Promise<void> => {
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
}
</script>

<style scoped>
.contact-page {
  padding: 80px 0;
  min-height: 100vh;
}
</style>
