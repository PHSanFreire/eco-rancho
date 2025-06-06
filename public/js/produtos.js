import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('produto-form');
const lista = document.getElementById('lista-produtos');
const produtosRef = collection(db, 'produtos');
const multiploInput = document.getElementById('multiplo');
const grupoDeQualProduto = document.getElementById('grupo-deQualProduto');
const selectDeQualProduto = document.getElementById('deQualProduto');

// Mostrar ou ocultar o campo deQualProduto com base no valor de "multiplo"
multiploInput.addEventListener('input', () => {
  const valor = parseInt(multiploInput.value);
  if (valor > 1) {
    grupoDeQualProduto.style.display = 'block';
  } else {
    grupoDeQualProduto.style.display = 'none';
    selectDeQualProduto.value = '';
  }
});

async function carregarListaProdutosNoSelect() {
  const snap = await getDocs(produtosRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement('option');
    option.value = data.nome;
    option.textContent = data.nome;
    selectDeQualProduto.appendChild(option);
  });
}

async function listarProdutos() {
  lista.innerHTML = '';
  const snap = await getDocs(produtosRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${data.nome}</strong> - R$ ${data.precoVenda?.toFixed(2)} 
      (Estoque: ${data.estoque ?? 0}) 
      <button onclick="excluirProduto('${docSnap.id}')">🗑️</button>
    `;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const novoProduto = {
    codigo: form.codigo.value,
    nome: form.nome.value,
    descricao: form.descricao.value,
    precoVenda: parseFloat(form.precoVenda.value),
    multiplo: parseInt(form.multiplo.value) || 1,
    deQualProduto: selectDeQualProduto.value || "",
    estoque: 0
  };
  await addDoc(produtosRef, novoProduto);
  form.reset();
  grupoDeQualProduto.style.display = 'none';
  listarProdutos();
});

window.excluirProduto = async function (id) {
  await deleteDoc(doc(produtosRef, id));
  listarProdutos();
};

listarProdutos();
carregarListaProdutosNoSelect();
