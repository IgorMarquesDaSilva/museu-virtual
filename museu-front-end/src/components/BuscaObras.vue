<template>
  <div>
    <form class="search-form" @submit.prevent="pesquisar">
      <span class="search-icon" aria-hidden="true">⌕</span>
      <label class="sr-only" for="art-search">Pesquisar obras de arte</label>
      <input id="art-search" v-model="termo" type="search" placeholder="Busque por tema, artista ou obra..." autocomplete="off" />
      <button type="submit" :disabled="loading">{{ loading ? 'Buscando...' : 'Pesquisar' }} <span aria-hidden="true">↗</span></button>
    </form>
    <div class="suggestions">
      <span>Experimente:</span>
      <button v-for="sugestao in sugestoes" :key="sugestao" type="button" @click="selecionarSugestao(sugestao)">{{ sugestao }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BuscaObras',
  props: { loading: { type: Boolean, required: true } },
  emits: ['search'],
  data() {
    return {
      termo: 'flores',
      sugestoes: ['flores', 'retrato', 'paisagem', 'gato']
    };
  },
  methods: {
    pesquisar() {
      this.$emit('search', this.termo);
    },
    selecionarSugestao(sugestao) {
      this.termo = sugestao;
      this.pesquisar();
    }
  }
};
</script>
