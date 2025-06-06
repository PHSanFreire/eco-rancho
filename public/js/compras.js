import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, updateDoc, increment, Timestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('compra-form');
const fornecedorSelect = document.getElementById('fornecedor');
const produtoSelect = document.getElementById('produto');
const carrinhoLista = document.getElementById('carrinho');
const adicionarBtn = document.getElementById('adicionar');
const listaCompras = document.getElementById('lista-compras');
const dataInput = document.getElementById('data');
const formaPagamento = document.getElementById('formaPagamento');

const produtosRef = collection(db, 'produtos');
const pessoasRef = collection(db, 'pessoas');
const comprasRef = collection(db, 'compras');

let carrinho = [];

function dataHoje() {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}
dataInput.value = dataHoje();

async function carregarFornecedores() {
  const snap = await getDocs(pessoasRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.tipo === 'fornecedor' || data.tipo === 'ambos') {
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = data.nomeSocial;
      fornecedorSelect.appendChild(option);
    }
  });
}

async function carregarProdutos() {
  const snap = await getDocs(produtosRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = data.nome;
    produtoSelect.appendChild(option);
  });
}

function atualizarCarrinho() {
  carrinhoLista.innerHTML = '';
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.nome} - ${item.quantidade} x R$ ${item.valorUnitario.toFixed(2)}`;
    const btn = document.createElement('button');
    btn.textContent = '❌';
    btn.onclick = () => {
      carrinho.splice(index, 1);
      atualizarCarrinho();
    };
    li.appendChild(btn);
    carrinhoLista.appendChild(li);
  });
}

adicionarBtn.addEventListener('click', () => {
  const produtoId = produtoSelect.value;
  const nome = produtoSelect.options[produtoSelect.selectedIndex].text;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const valorUnitario = parseFloat(document.getElementById('valorUnitario').value);
  if (!produtoId || !quantidade || !valorUnitario) return;
  carrinho.push({ produtoId, nome, quantidade, valorUnitario });
  atualizarCarrinho();
  produtoSelect.value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('valorUnitario').value = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fornecedorId = fornecedorSelect.value;
  const fornecedorNome = fornecedorSelect.options[fornecedorSelect.selectedIndex].text;
  const data = new Date(dataInput.value);
  const forma = formaPagamento.value;
  const valorTotal = carrinho.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);

  await addDoc(comprasRef, {
    fornecedorId,
    fornecedorNome,
    produtos: carrinho,
    data: Timestamp.fromDate(data),
    valorTotal,
    formaPagamento: forma
  });

  for (const item of carrinho) {
    const ref = doc(produtosRef, item.produtoId);
    await updateDoc(ref, {
      estoque: increment(item.quantidade)
    });
  }

  carrinho = [];
  atualizarCarrinho();
  produtoSelect.value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('valorUnitario').value = '';
  formaPagamento.value = '';
  listarCompras();
});

async function listarCompras() {
  listaCompras.innerHTML = '';
  const q = query(comprasRef, orderBy("data", "desc"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const dataFormatada = data.data?.toDate().toLocaleDateString("pt-BR") || '';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${data.fornecedorNome}</strong> - R$ ${data.valorTotal?.toFixed(2)} em ${dataFormatada} via ${data.formaPagamento}`;
    listaCompras.appendChild(li);
  });
}

carregarFornecedores();
carregarProdutos();
listarCompras();
