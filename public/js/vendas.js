import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, updateDoc, increment, Timestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('venda-form');
const clienteSelect = document.getElementById('cliente');
const produtoSelect = document.getElementById('produto');
const carrinhoLista = document.getElementById('carrinho');
const adicionarBtn = document.getElementById('adicionar');
const listaVendas = document.getElementById('lista-vendas');
const dataInput = document.getElementById('data');
const formaPagamento = document.getElementById('formaPagamento');

const produtosRef = collection(db, 'produtos');
const pessoasRef = collection(db, 'pessoas');
const vendasRef = collection(db, 'vendas');

let carrinho = [];
let produtosInfo = {};

function dataHoje() {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}
dataInput.value = dataHoje();

async function carregarClientes() {
  const snap = await getDocs(pessoasRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.tipo === 'cliente' || data.tipo === 'ambos') {
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = data.nomeSocial;
      clienteSelect.appendChild(option);
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
    produtosInfo[docSnap.id] = data;
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
  const clienteId = clienteSelect.value || null;
  const clienteNome = clienteSelect.options[clienteSelect.selectedIndex]?.text || 'Não informado';
  const data = new Date(dataInput.value);
  const forma = formaPagamento.value;
  const desconto = parseFloat(document.getElementById('desconto').value) || 0;
  const acrescimo = parseFloat(document.getElementById('acrescimo').value) || 0;
  const valorTotal = carrinho.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0) - desconto + acrescimo;

  await addDoc(vendasRef, {
    clienteId,
    clienteNome,
    produtos: carrinho,
    data: Timestamp.fromDate(data),
    valorTotal,
    desconto,
    acrescimo,
    formaPagamento: forma
  });

  for (const item of carrinho) {
    const ref = doc(produtosRef, item.produtoId);
    await updateDoc(ref, {
      estoque: increment(-item.quantidade)
    });
  }

  carrinho = [];
  atualizarCarrinho();
  produtoSelect.value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('valorUnitario').value = '';
  formaPagamento.value = '';
  document.getElementById('desconto').value = '';
  document.getElementById('acrescimo').value = '';
  listarVendas();
});

async function listarVendas() {
  listaVendas.innerHTML = '';
  const q = query(vendasRef, orderBy("data", "desc"));
  const snap = await getDocs(q);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const dataFormatada = data.data?.toDate().toLocaleDateString("pt-BR") || '';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${data.clienteNome}</strong> - R$ ${data.valorTotal?.toFixed(2)} em ${dataFormatada} via ${data.formaPagamento}`;
    listaVendas.appendChild(li);
  });
}

carregarClientes();
carregarProdutos();

// Auto preencher valor unitário ao selecionar produto
produtoSelect.addEventListener('change', () => {
  const produtoId = produtoSelect.value;
  if (produtosInfo[produtoId]) {
    document.getElementById('valorUnitario').value = produtosInfo[produtoId].precoVenda || '';
  }
});
listarVendas();
