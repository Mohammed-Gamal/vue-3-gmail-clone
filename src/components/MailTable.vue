<template>
  <h1>{{ emailSelection.emails.size }} emails selected</h1>
  <table class="mail-table">
    <tbody>
      <tr
        v-for="email in unarchivedEmails"
        :key="email.id"
        :class="['clickable', { read: email.read }]"
      >
        <td>
          <input
            type="checkbox"
            @click="emailSelection.toggle(email)"
            :selected="emailSelection.emails.has(email)"
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
  import { ref, reactive } from 'vue'
  import MailView from '@/components/MailView.vue'
  import ModalView from '@/components/ModalView.vue'

  export default {
    async setup() {
      const { data: emails } = await API.getEmails()

      let selected = reactive(new Set())
      let emailSelection = {
        emails: selected,
        toggle(email) {
          if (selected.has(email)) {
            selected.delete(email)
          } else {
            selected.add(email)
          }
        }
      }

      return {
        emailSelection,
        format,
        emails: ref(emails),
        openedEmail: ref(null)
      }
    },
    components: {
      MailView,
      ModalView
    },
    computed: {
      sortEmails() {
        return this.emails.sort((e1, e2) => {
          return e1.sentAt < e2.sentAt ? 1 : -1
        })
      },
      unarchivedEmails() {
        return this.sortEmails.filter(e => !e.archived)
      }
    },
    methods: {
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
          let emails = this.unarchivedEmails
          let currentIndex = emails.indexOf(email)
          let newEmail = emails[currentIndex + changeIndex]

          this.openEmail(newEmail)
        }
      }
    }
  }
</script>
