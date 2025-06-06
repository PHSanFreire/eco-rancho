import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, doc, updateDoc, increment, Timestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('producao-form');
const selectProduto = document.getElementById('produto');
const lista = document.getElementById('lista-producao');

const produtosRef = collection(db, 'produtos');
const producaoRef = collection(db, 'producao');

function dataHoje() {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}
document.getElementById('data').value = dataHoje();

async function carregarProdutos() {
  const snap = await getDocs(produtosRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = data.nome;
    selectProduto.appendChild(option);
  });
}

async function listarProducao() {
  lista.innerHTML = '';
  const q = query(producaoRef, orderBy("data", "desc"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const dataFormatada = data.data?.toDate().toLocaleDateString("pt-BR") || '';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${data.produtoNome}</strong> - ${data.quantidade} unidades em ${dataFormatada}`;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const produtoId = selectProduto.value;
  const produtoNome = selectProduto.options[selectProduto.selectedIndex].text;
  const quantidade = parseInt(form.quantidade.value);
  const data = new Date(form.data.value);

  await addDoc(producaoRef, {
    produtoId,
    produtoNome,
    quantidade,
    data: Timestamp.fromDate(data)
  });

  const produtoDoc = doc(produtosRef, produtoId);
  await updateDoc(produtoDoc, {
    estoque: increment(quantidade)
  });

  form.reset();
  document.getElementById('data').value = dataHoje();
  listarProducao();
});

carregarProdutos();
listarProducao();
