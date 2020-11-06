import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';

import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation, updateNote as updateNoteMutation } from './graphql/mutations';

const initialFormState = { dep: '', name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editFlag, setEditFlag] = useState(false);
  const [editData, setEditData] = useState(0);

 


  useEffect(() => {
    fetchNotes();
  }, []);
  useEffect(() => {
    fetchNotes();
  }, [notes]);


  function updateHandler (data){
    setFormData ({...formData, dep: data.dep, name: data.name, description: data.description})
    setEditData (data)
    console.log("test", data)
    setEditFlag(true)
    //   setNotes([]);
    //  fetchNotes();
  }
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      // if (note.image) {
      //   const image = await Storage.get(note.image);
      //   note.image = image;
      //  }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }
  async function createNote() {
    if (!formData.name || !formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    // if (formData.image) {
    //   const image = await Storage.get(formData.image);
    //   formData.image = image;
    // }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }
  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  async function updateNote() {
    const tempData = formData;
    tempData.id = editData.id;
    console.log("temp data", tempData)
    // const newNotesArray = notes.filter(note => note.id !== id);
    // setNotes(newNotesArray);
    let x = await API.graphql({ query: updateNoteMutation, variables: { input: tempData  }});
    console.log("resr", x)
    setEditFlag(false)
   
    
  }
  // async function onChange(e) {
  //   if (!e.target.files[0]) return
  //   const file = e.target.files[0];
  //   // setFormData({ ...formData, image: file.name });
  //   // await Storage.put(file.name, file);
  //   fetchNotes();
  // }
    
  return (
    <div className="App">
      <h1>My Notes App</h1>
      
       
      <input
        onChange={e => setFormData({ ...formData, 'dep': e.target.value})}
        placeholder="Note name"
        value={formData.dep}
      />

      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      {editFlag?
      
      <>
      <button onClick={updateNote}>Edit Note.</button><button onClick={()=>{
        setEditFlag(false)
      }}>Cancel</button></>:
      <button onClick={createNote}>Create Note</button>}
      

      <div style={{marginBottom: 30}}>
       <table width = '50%' align ="center" 
       border = "1" 
       style={{marginTop: "50px" }}>        
        <tr>
        <th>Dep</th>
          <th>Name</th>
           <th>Description</th>
          <th>Edit</th>
          <th>Delete</th>
         </tr>
       
        {
          notes.map(note => (
           <tr>
             <td>{note.dep}</td>
          <td>{note.name}</td>
          <td>{note.description}</td>
          <td><button onClick={() => updateHandler(note)}>Edit</button></td>
           <td><button onClick={() => deleteNote(note)}>Delete</button></td>
        </tr>
          ))}
        </table>
   

      </div>
      
    </div>
  );
}

export default App;