<template>
  <section class="account-section">
    <div class="account-card">
      <p class="section-kicker">SUA CONTA / LOGIN</p>
      <h2>Bem-vindo de volta</h2>
      <p class="account-copy">Entre para acessar seu perfil e sua coleção pessoal.</p>
      <p v-if="error" class="notice error">{{ error }}</p>
      <form class="account-form" @submit.prevent="submit">
        <label>E-mail<input v-model.trim="email" type="email" autocomplete="email" required maxlength="160"></label>
        <label>Senha<input v-model="password" type="password" autocomplete="current-password" required minlength="8" maxlength="72"></label>
        <button type="submit" :disabled="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
      </form>
      <p class="account-switch">Ainda não tem uma conta? <router-link to="/cadastro">Cadastre-se</router-link></p>
    </div>
  </section>
</template>

<script>
import { authController } from '../controllers/authController';
import { errorMessage } from '../controllers/museumController';

export default {
  name: 'LoginView',
  emits: ['auth-changed'],
  data() {
    return { email: '', password: '', loading: false, error: '' };
  },
  methods: {
    async submit() {
      this.loading = true;
      this.error = '';
      try {
        await authController.entrar({ email: this.email, password: this.password });
        this.$emit('auth-changed');
        this.$router.push(String(this.$route.query.redirect || '/'));
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
