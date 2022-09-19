<template>
  <div class="buttons">
    <button
      :class="['nav-btn', { active: selectedScreen === 'inbox'}]"
      :disabled="selectedScreen === 'inbox'"
      @click="selectScreen('inbox')"
    >Inbox</button>
    <button
      :class="['nav-btn', { active: selectedScreen === 'archive'}]"
      :disabled="selectedScreen === 'archive'"
      @click="selectScreen('archive')"
    >Archived</button>
  </div>
  <h1>{{ emailSelection.emails.size }} emails selected</h1>
  <BulkActionBar :emails="filteredEmails" />
  <table class="mail-table">
    <tbody>
      <tr
        v-for="email in filteredEmails"
        :key="email.id"
        :class="['clickable', { read: email.read }]"
      >
        <td>
          <input
            type="checkbox"
            @click="emailSelection.toggle(email)"
            :checked="emailSelection.emails.has(email)"
          />
        </td>
        <td @click="openEmail(email)">{{ email.from }}</td>
        <td @click="openEmail(email)">
          <p>
            <strong>{{ email.body }}</strong> - {{ email.body }}
          </p>
        </td>
        <td class="date" @click="openEmail(email)">{{ format(new Date(email.sentAt), 'MMM do yyyy') }}</td>
        <td>
          <button type="button" @click="archiveEmail(email)">Archive</button>
        </td>
      </tr>
    </tbody>
  </table>
  <ModalView v-if="openedEmail" @closeModal="openedEmail = null">
    <MailView :email="openedEmail" @changeEmail="changeEmail" />
  </ModalView>
</template>

<script>
  import { format } from 'date-fns'
  import API from '@/services/API'
  import { ref } from 'vue'
  import MailView from '@/components/MailView.vue'
  import ModalView from '@/components/ModalView.vue'
  import BulkActionBar from '@/components/BulkActionBar.vue'
  import useEmailSelection from '@/composables/use-email-selection'

  export default {
    async setup() {
      const { data: emails } = await API.getEmails()

      return {
        emailSelection: useEmailSelection(),
        format,
        emails: ref(emails),
        openedEmail: ref(null),
        selectedScreen: ref('inbox')
      }
    },
    components: {
      MailView,
      ModalView,
      BulkActionBar
    },
    computed: {
      sortEmails() {
        return this.emails.sort((e1, e2) => {
          return e1.sentAt < e2.sentAt ? 1 : -1
        })
      },
      filteredEmails() {
        if (this.selectedScreen == 'inbox') {
          return this.sortEmails.filter(e => !e.archived)
        } else {
          return this.sortEmails.filter(e => e.archived)
        }
      }
    },
    methods: {
      selectScreen(newScreen) {
        this.selectedScreen = newScreen
        this.emailSelection.clear()
      },
      openEmail(email) {
        this.openedEmail = email

        if (email) {
          email.read = true
          API.updateEmail(email)
        }
      },
      archiveEmail(email) {
        email.archived = true
        API.updateEmail(email)
      },
      changeEmail({toggleRead, toggleArchive, save, closeModal, changeIndex}) {
        let email = this.openedEmail

        if (toggleRead) { email.read = !email.read }
        if (toggleArchive) { email.archived = !email.archived }
        if (save) { API.updateEmail(email) }
        if (closeModal) { this.openedEmail = null }

        if (changeIndex) {
          let emails = this.filteredEmails
          let currentIndex = emails.indexOf(email)
          let newEmail = emails[currentIndex + changeIndex]

          this.openEmail(newEmail)
        }
      }
    }
  }
</script>
