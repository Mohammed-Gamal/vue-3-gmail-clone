<template>
  <table class="mail-table">
    <tbody>
      <tr
        v-for="email in unarchivedEmails"
        :key="email.id"
        :class="['clickable', { read: email.read }]"
        @click="openEmail(email)"
      >
        <td>
          <input type="checkbox" />
        </td>
        <td>{{ email.from }}</td>
        <td>
          <p>
            <strong>{{ email.body }}</strong> - {{ email.body }}
          </p>
        </td>
        <td class="date">{{ format(new Date(email.sentAt), 'MMM do yyyy') }}</td>
        <td>
          <button type="button" @click="archiveEmail(email)">Archive</button>
        </td>
      </tr>
    </tbody>
  </table>
  <ModalView v-if="openedEmail" @closeModal="openedEmail = null">
    <MailView :email="openedEmail" />
  </ModalView>
</template>

<script>
  import { format } from 'date-fns'
  import axios from 'axios'
  import { ref } from 'vue'
  import MailView from '@/components/MailView.vue'
  import ModalView from '@/components/ModalView.vue'

  export default {
    async setup() {
      const { data: emails } = await axios.get('http://localhost:3000/emails')

      return {
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
        email.read = true
        this.updateEmail(email)
        this.openedEmail = email
      },
      archiveEmail(email) {
        email.archived = true
        this.updateEmail(email)
      },
      updateEmail(email) {
        axios.put(`http://localhost:3000/emails/${email.id}`, email)
      }
    }
  }
</script>