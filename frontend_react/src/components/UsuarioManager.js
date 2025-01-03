import React, { useState, useEffect } from 'react';
import UsuarioService from '../services/UsuarioService';
import Modal from './Modal';

function UsuarioManager() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [newUsuario, setNewUsuario] = useState({ name: '', email: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    UsuarioService.getAll()
      .then(data => setUsuarios(data))
      .catch(error => console.error('Error fetching usuários:', error));
  }, []);

  useEffect(() => {
    if (editingUsuario) {
      setNewUsuario(editingUsuario);
    } else {
      setNewUsuario({ name: '', email: '', password: '' });
    }
  }, [editingUsuario]);
  
  const handleDeleteUsuario = (usuarioId) => {
    UsuarioService.delete(usuarioId)
      .then(() => setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioId)))
      .catch(error => console.error('Error deleting usuário:', error));
  };

  const handleUsuarioSubmit = (e) => {
    e.preventDefault();
    if (!newUsuario.name || !newUsuario.email || newUsuario.password.length < 8) {
      setError('Todos os campos são obrigatórios e a senha deve ter pelo menos 8 caracteres!');
      return;
    }

    const action = editingUsuario
      ? UsuarioService.update(editingUsuario.id, newUsuario)
      : UsuarioService.create(newUsuario);

    action
      .then(data => {
        if (editingUsuario) {
          setUsuarios(usuarios.map(usuario => (usuario.id === editingUsuario.id ? data : usuario)));
        } else {
          setUsuarios([...usuarios, data]);
        }
        setEditingUsuario(null);
        setNewUsuario({ name: '', email: '', password: '' });
        setError('');
        setShowModal(false);
      })
      //.catch(error => console.error('Error submitting usuário:', error));
      .catch(error => alert(error.response.data.message));
  };

  return (
    <div>
      <table className="table">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th className="actions-column">Ações</th>
    </tr>
  </thead>
  <tbody>
    {usuarios.map(usuario => (
      <tr key={usuario.id}>
        <td>{usuario.name}</td>
        <td>{usuario.email}</td>
        <td className="table-actions">
          <button
            className="button edit"
            onClick={() => setEditingUsuario(usuario)}
          >
            Editar
          </button>
          <button
            className="button delete"
            onClick={() => handleDeleteUsuario(usuario.id)}
          >
            Excluir
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
<button onClick={() => {
  setEditingUsuario(null);
  setNewUsuario({ name: '', email: '', password: '' });
  setShowModal(true);
}}>
  Adicionar Novo Usuário
</button>
<br></br>
<Modal
  show={!!editingUsuario || showModal} 
  onClose={() => {
    setEditingUsuario(null);
    setNewUsuario({ name: '', email: '', password: '' });
    setShowModal(false);
  }}
  title={editingUsuario ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
>
  <form onSubmit={handleUsuarioSubmit}>
    <input
      type="text"
      placeholder="Nome"
      value={newUsuario.name}
      onChange={(e) => setNewUsuario({ ...newUsuario, name: e.target.value })}
    />
    <input
      type="email"
      placeholder="Email"
      value={newUsuario.email}
      onChange={(e) => setNewUsuario({ ...newUsuario, email: e.target.value })}
    />
    <input
      type="password"
      placeholder="Senha"
      value={newUsuario.password}
      onChange={(e) => setNewUsuario({ ...newUsuario, password: e.target.value })}
    />
    {error && <p className="error-message">{error}</p>} {}
    <button type="submit" className="save-button">Salvar</button>
  </form>
</Modal>
      <p>JSON de api/usuarios:</p>
      {!usuarios && !error ? (
        <p>Carregando...</p>
      ) : (
        <pre style={styles.json}>{JSON.stringify(usuarios, null, 2)}</pre>
      )}
    </div>
  );
}

const styles = {
  json: {
    backgroundColor: '#f4f4f4', // Fundo suave
    padding: '10px',            // Espaçamento interno
    borderRadius: '8px',        // Bordas arredondadas
    fontFamily: 'monospace',     // Fonte monoespaçada para alinhamento
    whiteSpace: 'pre-wrap',      // Quebra de linha automática
    overflowWrap: 'break-word',  // Evita palavras longas fora da área
    color: '#008000',              // Cor de texto
    border: '1px solid #ccc',   // Borda suave
    maxHeight: '400px',         // Limite de altura
    overflowY: 'auto',          // Barra de rolagem se necessário
    textAlign: 'left'           // Alinha o texto à esquerda
  },
};

export default UsuarioManager;