<template>
  <section class="account-section">
    <div class="account-card">
      <p class="section-kicker">SUA CONTA / PERFIL</p>
      <h2>Seu perfil</h2>
      <p class="account-copy">Mantenha seus dados atualizados.</p>
      <p v-if="message" class="notice">{{ message }}</p>
      <p v-if="error" class="notice error">{{ error }}</p>
      <form class="account-form" @submit.prevent="submit">
        <label>Nome<input v-model.trim="name" type="text" autocomplete="name" required minlength="2" maxlength="80"></label>
        <label>E-mail<input v-model.trim="email" type="email" autocomplete="email" required maxlength="160"></label>
        <button type="submit" :disabled="loading">{{ loading ? 'Salvando...' : 'Salvar alterações' }}</button>
      </form>
      <p v-if="createdAt" class="account-since">Conta criada em {{ createdAt }}.</p>
    </div>
  </section>
</template>

<script>
import { authController, authState } from '../controllers/authController';
import { errorMessage } from '../controllers/museumController';

export default {
  name: 'PerfilView',
  emits: ['auth-changed'],
  data() {
    return { name: authState.user?.name || '', email: authState.user?.email || '', loading: false, error: '', message: '' };
  },
  computed: {
    createdAt() {
      if (!authState.user?.createdAt) return '';
      return new Intl.DateTimeFormat('pt-BR').format(new Date(`${authState.user.createdAt}Z`));
    }
  },
  methods: {
    async submit() {
      this.loading = true;
      this.error = '';
      this.message = '';
      try {
        await authController.atualizar({ name: this.name, email: this.email });
        this.message = 'Perfil atualizado com sucesso.';
        this.$emit('auth-changed');
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
