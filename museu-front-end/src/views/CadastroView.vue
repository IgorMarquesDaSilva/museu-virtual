<template>
  <section class="account-section">
    <div class="account-card">
      <p class="section-kicker">SUA CONTA / CADASTRO</p>
      <h2>Crie sua conta</h2>
      <p class="account-copy">Guarde suas obras favoritas em uma coleção só sua.</p>
      <p v-if="error" class="notice error">{{ error }}</p>
      <form class="account-form" @submit.prevent="submit">
        <label>Nome<input v-model.trim="name" type="text" autocomplete="name" required minlength="2" maxlength="80"></label>
        <label>E-mail<input v-model.trim="email" type="email" autocomplete="email" required maxlength="160"></label>
        <label>Senha<input v-model="password" type="password" autocomplete="new-password" required minlength="8" maxlength="72"><small>Use pelo menos 8 caracteres.</small></label>
        <label>Confirme a senha<input v-model="confirmation" type="password" autocomplete="new-password" required minlength="8" maxlength="72"></label>
        <button type="submit" :disabled="loading">{{ loading ? 'Criando conta...' : 'Criar conta' }}</button>
      </form>
      <p class="account-switch">Já tem uma conta? <router-link to="/login">Entre</router-link></p>
    </div>
  </section>
</template>

<script>
import { authController } from '../controllers/authController';
import { errorMessage } from '../controllers/museumController';

export default {
  name: 'CadastroView',
  emits: ['auth-changed'],
  data() {
    return { name: '', email: '', password: '', confirmation: '', loading: false, error: '' };
  },
  methods: {
    async submit() {
      if (this.password !== this.confirmation) {
        this.error = 'As senhas não coincidem.';
        return;
      }
      this.loading = true;
      this.error = '';
      try {
        await authController.cadastrar({ name: this.name, email: this.email, password: this.password });
        this.$emit('auth-changed');
        this.$router.push('/perfil');
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
