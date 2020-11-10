import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
//import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation, updateNote as updateNoteMutation } from './graphql/mutations';


const initialFormState = { email: 'hai',name: '', description: '' }

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
    setFormData ({...formData, email: data.email, name: data.name, description: data.description})
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
    if ( !formData.name || !formData.description) return;
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
    console.log("result", x)
   
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
    <div id="notes-app" className="App">
      <h1 style={{ color: 'red' }}>PluginHive</h1>
      
      
      <input
        onChange={e => setFormData({ ...formData, 'email': e.target.value})}
        placeholder="Enter Email"
        value={formData.email}
      />
    
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Enter Name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Enter Place"
        value={formData.description}
      />
      {editFlag?
      
      <>
      <button style={{ color: "white", background: "green" }}
       onClick={updateNote}>Edit</button>
       <button style={{ color: "white", background: "red" }} onClick={()=>{
        setEditFlag(false)
      }}>Cancel</button></>:
      <button style={{ color: "white", background: "green" }}
      onClick={createNote}>Create</button>}
      

      <div  style={{marginBottom: 30 }}>
       <table
       width = '80%' align ="center" 
       border = "1" bgcolor ="AE9792" textcolor="white"
       style={{marginTop: "50px"} }  >    
     
        <tr>
        <th>email</th>
          <th>Name</th>
          <th>Place</th>
          <th>Edit</th>
          <th>Delete</th>
         </tr>
       
        {
          notes.map(note => (
           <tr>
           <td>{note.email}</td>
          <td>{note.name}</td>
          <td>{note.description}</td>
          <td><button style={{ color: "white", background: "green" }} 
           onClick={() => updateHandler(note)}>Edit</button></td>
          <td><button style={{ color: "white", background: "red" }} 
           onClick={() => deleteNote(note)}>Delete</button></td>
        </tr>
          ))}
        </table>
   

      </div>
      {/* <AmplifySignOut /> */}
    </div>
  );
}

// export default withAuthenticator(App);
export default App;

