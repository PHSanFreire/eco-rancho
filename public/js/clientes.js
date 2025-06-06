import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('cliente-form');
const lista = document.getElementById('lista-clientes');
const clientesRef = collection(db, 'pessoas');

async function listarClientes() {
  lista.innerHTML = '';
  const snap = await getDocs(clientesRef);
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${data.nomeSocial}</strong> (${data.tipo})<br>
      Contato: ${data.contato || '—'} | Limite: R$ ${data.limiteCredito?.toFixed(2) || '0,00'}<br>
      <button onclick="excluirCliente('${docSnap.id}')">🗑️ Excluir</button>
    `;
    lista.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const novo = {
    nomeSocial: form.nomeSocial.value,
    nomeCompleto: form.nomeCompleto.value,
    contato: form.contato.value,
    email: form.email.value,
    limiteCredito: parseFloat(form.limiteCredito.value) || 0,
    tipo: form.tipo.value,
    saldo: 0
  };
  await addDoc(clientesRef, novo);
  form.reset();
  listarClientes();
});

window.excluirCliente = async function (id) {
  await deleteDoc(doc(clientesRef, id));
  listarClientes();
};

listarClientes();
