import { error } from "@sveltejs/kit";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { formatInterger } from "./tools";

// Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Init App
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

// firestore
const db = getFirestore(app)

// observe authc changes
const authStateListener = (callback) => {
    return onAuthStateChanged(auth, async(user) => {
        if (user) {
            const userRef = doc(db, 'users', user.uid)
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            })

            const roleRef = doc(db, 'roles', user.uid)
            const roleData = await getDoc(roleRef)
            if (roleData.exists()) {
                user = { ...user, role: roleData.data().role }
                callback(user)
            } 
        } else {
            callback(null)
        }
    })
}

// SignIn
const fnSignIn = async() => {
    await signInWithPopup(auth, provider)
}

// SignOut
const fnSignOut = async() => {
    await signOut(auth)
}

// Get Data Kas
const getKasP2g = (callback) => {
    try {
        let colRef = collection(db, 'kas')
        colRef = query(colRef, orderBy('tanggal'))

        return onSnapshot(colRef, 
            (snapshot) => { callback(snapshot, null) },
            (err) => { throw new Error(err) }
        )
    } catch (err) {
        let error = `${err?.code ? err?.code : 'error'} : ${err?.message ? err?.message : err}}`
        callback(null, error)
        return() => {}
    }
}

// Add kas
const addKas = async(formData, callback) => {
    let result = null
    let error = null

    try {
        const colRef = collection(db, 'kas')
        return await addDoc(colRef, {
            tanggal: new Date(formData.tanggal),
            jumlah: formatInterger(formData.jumlah),
            type: formData.type,
            ket: formData.ket,
        })
        .then(() => {
            result = 'Tambah data berhasil.'
        })
        .catch((error) => {
            throw new Error(error);
        })  
    } catch (error) {
        error = `${err?.code ? err.code : 'error'} : ${err?.message ? err.message : err}}`
    } finally {
        callback(result, error)
        return() => {}
    }
    
}

// Update Kas
const updateKas = async(formData, callback) => {
    let result = null
    let error = null

    try {
        if (!formData.id) throw new Error("Invalid ID");
        
        const docRef = doc(db, 'kas', formData.id)
        return await updateDoc(docRef, {
            tanggal: new Date(formData.tanggal),
            type: formData.type,
            jumlah: formatInterger(formData.jumlah),
            ket: formData.ket,
        }, { merge: true })
        .then(() => {
            result = "Update data berhasil."
        })
        .catch((error) => {
            throw new Error(error);
        })  
    } catch (error) {
        error = `${err?.code ? err.code : 'error'} : ${err?.message ? err.message : err}}`
    } finally {
        callback(result, error)
        return() => {}
    }
    
}

// delete Kas
const deleteKas = async(id, callback) => {
    let result = null
    let error = null

    try {
        if (!id) throw new Error("Invalid ID");

        const docRef = doc(db, 'kas', id)
        return await deleteDoc(docRef)
        .then(() => { result = 'Hapus data berhasil' })
        .catch(error => { throw new Error(error); }) 
    } catch (error) {
        error = `${err?.code ? err.code : 'error'} : ${err?.message ? err.message : err}}`
    } finally {
        callback(result, error)
        return() => {}
    }
}

// get data user
const getUser = async(callback) => {
    let result = null
    let error = null

    try {
        const colRolesRef = collection(db, 'roles')
        let dataRole = {}
        await getDocs(colRolesRef)
        .then(res => { 
            dataRole = res.docs.reduce((prev, res) => {
                prev[res.id] = res.data()
                return prev                
            },{})
        })
        .catch((err) => { throw new Error(err) })

        const colUsersRef = collection(db, 'users')
        await getDocs(colUsersRef)
        .then((res) => {
            result = res.docs.map((val) => ({
                id: val.id, ...val.data(),
                role: dataRole[val.id]?.role ? dataRole[val.id].role : null
            }))
        })
        .catch((err) => { throw new Error(err) })
        
    } catch (err) {
        error = `${err?.code ? err.code : 'error'} : ${err?.message ? err.message : err}}`
    } finally {
        callback(result, error)
        return() => {}
    }
}

// update data user
const updateUser = async(formData, callback) => {
    let result = null
    let error = null

    try {
        if (!formData.id) throw new Error("Invalid ID");
        
        const docRef = doc(db, 'roles', formData.id)
        await setDoc(docRef, {
            role: formData?.role,
            email: formData?.email
        })
        .then(() => {
            result = "Update data berhasil."
        })
        .catch((err) => {
            error = `${err?.code ? err?.code : 'error'} : ${err?.message}`
        })  
    } catch (err) {
        error = `${err?.code ? err?.code : 'Error'} : ${err?.message}`
    } finally {
        callback(result, error)
        return() => {}
    }
}

// delete data user
const deleteUser = async(formData, callback) => {
    let result = null
    let error = null

    try {
        if (!formData.id) throw new Error("Error: Invalid ID");

        const docRef = doc(db, 'roles', formData.id)
        await deleteDoc(docRef)
        .then((res) => result = "Hapus data berhasil.")
        .catch(err => {throw new Error(err)});

    } catch (err) {
        error = `${err?.code ? err.code : 'error'} : ${err?.message ? err.message : err}}`
    } finally {
        callback(result, error)
        return() => {}
    }
}

export { authStateListener, fnSignIn, fnSignOut }
export { getKasP2g, addKas, updateKas, deleteKas }
export { getUser, updateUser, deleteUser }
