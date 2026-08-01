/*==========================================
    SATU MART POS
    APP.JS PART 1
==========================================*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmCwuU-yvj4ThbFiJi2hed3LapWQK-dpM",
  authDomain: "satumart-3697e.firebaseapp.com",
  projectId: "satumart-3697e",
  storageBucket: "satumart-3697e.firebasestorage.app",
  messagingSenderId: "340610834874",
  appId: "1:340610834874:web:bbe98bfaa7f47b13e77d83",
  measurementId: "G-40VMHCZN9K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//=========================
// DATABASE
//=========================

let products = [];
let transaksi = [];
let pengeluaran = [];

let cart = [];

let editMode = false;
let editId = null;
let fotoBase64 = "";
async function loadProducts(){

    products=[];

    const snapshot=await getDocs(collection(db,"products"));

    snapshot.forEach(docSnap=>{

        products.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    renderBarang();

}

async function saveProduct(data){

    await addDoc(collection(db,"products"),data);

    await loadProducts();

}

async function updateProduct(id,data){

    await updateDoc(doc(db,"products",id),data);

    await loadProducts();

}

async function deleteProduct(id){

    await deleteDoc(doc(db,"products",id));

    await loadProducts();

}

//=========================
// FORMAT RUPIAH
//=========================

function rupiah(angka){

    return "Rp " +
    Number(angka).toLocaleString("id-ID");

}

//=========================
// MENU SIDEBAR
//=========================

const menus = document.querySelectorAll(".menu");

const pages = document.querySelectorAll(".page");

menus.forEach(menu=>{

    menu.onclick=()=>{

        menus.forEach(m=>m.classList.remove("active"));

        pages.forEach(p=>p.classList.remove("active"));

        menu.classList.add("active");

        document
        .getElementById(
            menu.dataset.page
        )
        .classList.add("active");

    }

});

//=========================
// DASHBOARD
//=========================

function updateDashboard(){

    document.getElementById("totalBarang").innerHTML =
    products.length;

    let totalJual = 0;

    transaksi.forEach(item=>{

        totalJual += item.total;

    });

    let totalKeluar = 0;

    pengeluaran.forEach(item=>{

        totalKeluar += item.nominal;

    });

    document.getElementById("penjualanHari")
    .innerHTML = rupiah(totalJual);

    document.getElementById("pengeluaranHari")
    .innerHTML = rupiah(totalKeluar);

    document.getElementById("labaHari")
    .innerHTML = rupiah(
        totalJual-totalKeluar
    );

}

//=========================
// MODAL
//=========================

const modal = document.getElementById("modalBarang");

const btnTambahBarang =
document.getElementById("btnTambahBarang");

const btnTambahBarang2 =
document.getElementById("btnTambahBarang2");

const closeModal =
document.getElementById("closeModal");

btnTambahBarang.onclick=bukaTambahBarang;

btnTambahBarang2.onclick=bukaTambahBarang;

closeModal.onclick=()=>{

    modal.style.display="none";

};

window.onclick=(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

};

function bukaTambahBarang(){

    editMode=false;

    editId=null;

    fotoBase64="";

    document.getElementById("modalTitle")
    .innerHTML="Tambah Barang";

    document.getElementById("namaBarang").value="";

    document.getElementById("kategoriBarang").value="";

    document.getElementById("modalBarangHarga").value="";

    document.getElementById("hargaBarang").value="";

    document.getElementById("stokBarang").value="";

    document.getElementById("fotoBarang").value="";

    document.getElementById("previewFoto").src=
    "https://placehold.co/500x300?text=Preview";

    modal.style.display="flex";

}

//=========================
// UPLOAD FOTO
//=========================

document
.getElementById("fotoBarang")
.onchange=function(){

    const file=this.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(e){

        fotoBase64=e.target.result;

        document
        .getElementById("previewFoto")
        .src=fotoBase64;

    }

    reader.readAsDataURL(file);

};

//=========================
// LOAD AWAL
//=========================

updateDashboard();

/*==========================================
    SATU MART POS
    APP.JS PART 2
==========================================*/

//=========================
// RENDER BARANG
//=========================

function renderBarang(){

    const list = document.getElementById("listBarang");
    const produkKasir = document.getElementById("produkKasir");

    if(!list) return;

    list.innerHTML="";

    if(produkKasir){
        produkKasir.innerHTML="";
    }

    products.forEach(item=>{

const card = `
<div class="barang-card">

<img src="${item.foto}" alt="${item.nama}">

<div class="barang-body">

<h3>${item.nama}</h3>

<div class="kategori">
${item.kategori}
</div>

<div class="harga">
${rupiah(item.harga)}
</div>

<div class="stok">
Stok : ${item.stok}
</div>

<div class="action">

<button class="btn-kasir"
onclick="tambahKeKeranjang('${item.id}')">
<i class="fa fa-cart-plus"></i>
</button>

<button class="btn-edit"
onclick="editBarang('${item.id}')">
<i class="fa fa-pen"></i>
</button>

<button class="btn-hapus"
onclick="hapusBarang('${item.id}')">
<i class="fa fa-trash"></i>
</button>

</div>

</div>
</div>
`;


list.insertAdjacentHTML("beforeend", card);


if(produkKasir){
    produkKasir.insertAdjacentHTML("beforeend", card);
}

});

    updateDashboard();

}

//=========================
// SIMPAN BARANG
//=========================

document.getElementById("btnSimpanBarang").onclick = async function () {

    const nama=document.getElementById("namaBarang").value.trim();

    const kategori=document.getElementById("kategoriBarang").value.trim();

    const modalHarga=Number(
        document.getElementById("modalBarangHarga").value
    );

    const harga=Number(
        document.getElementById("hargaBarang").value
    );

    const stok=Number(
        document.getElementById("stokBarang").value
    );

    if(
        nama=="" ||
        kategori=="" ||
        harga<=0 ||
        stok<0
    ){

        alert("Lengkapi data barang.");

        return;

    }

if(editMode){

    const barang = products.find(p => p.id === editId);

    await updateProduct(editId,{

        nama,
        kategori,
        modal: modalHarga,
        harga,
        stok,

        foto: fotoBase64 === "" ? barang.foto : fotoBase64

    });

    alert("Barang berhasil diperbarui.");


    }else{

       await saveProduct({

    nama,
    kategori,
    modal:modalHarga,
    harga,
    stok,

    foto:
    fotoBase64==""?
    "https://placehold.co/500x300?text=Barang":
    fotoBase64

});

        alert("Barang berhasil ditambahkan.");

    }

    

    modal.style.display="none";
   
};

//=========================
// EDIT BARANG
//=========================

function editBarang(id){

    const barang=products.find(p=>p.id===id);

    if(!barang) return;

    editMode=true;

    editId=id;

    document.getElementById("modalTitle").innerHTML=
    "Edit Barang";

    document.getElementById("namaBarang").value=
    barang.nama;

    document.getElementById("kategoriBarang").value=
    barang.kategori;

    document.getElementById("modalBarangHarga").value=
    barang.modal;

    document.getElementById("hargaBarang").value=
    barang.harga;

    document.getElementById("stokBarang").value=
    barang.stok;

    fotoBase64=barang.foto;

    document.getElementById("previewFoto").src=
    barang.foto;

    modal.style.display="flex";

}

//=========================
// HAPUS BARANG
//=========================

async function hapusBarang(id){

    if(!confirm("Hapus barang ini?")) return;

    await deleteProduct(id);

}
//=========================
// SEARCH BARANG
//=========================

document
.getElementById("cariBarang")
.onkeyup=function(){

    const keyword=this.value.toLowerCase();

    document
    .querySelectorAll(".barang-card")
    .forEach(card=>{

        card.style.display=
        card.innerText
        .toLowerCase()
        .includes(keyword)
        ?
        "block"
        :
        "none";

    });

};

//=========================
// LOAD
//=========================

renderBarang();
/*==========================================
    SATU MART POS
    APP.JS PART 3
==========================================*/

//=========================
// TAMBAH KE KERANJANG
//=========================

function tambahKeKeranjang(id){

    const barang = products.find(p => p.id === id);

    if(!barang) return;

    if(barang.stok <= 0){

        alert("Stok barang habis.");

        return;

    }

    const ada = cart.find(c => c.id === id);

    if(ada){

        if(ada.qty >= barang.stok){

            alert("Stok tidak mencukupi.");

            return;

        }

        ada.qty++;

    }else{

        cart.push({

            id:barang.id,
            nama:barang.nama,
            harga:barang.harga,
            modal:barang.modal,
            foto:barang.foto,
            qty:1

        });

    }

    renderCart();

}

//=========================
// RENDER KERANJANG
//=========================

function renderCart(){

    const el=document.getElementById("cart");

    el.innerHTML="";

    if(cart.length===0){

        el.innerHTML='<p class="empty">Belum ada barang</p>';

        document.getElementById("totalBayar").innerHTML=rupiah(0);
        document.getElementById("kembalian").innerHTML=rupiah(0);

        return;

    }

    let total=0;

    cart.forEach(item=>{

        total += item.harga * item.qty;

        el.innerHTML += `

        <div class="cart-item">

            <div class="cart-info">

                <img src="${item.foto}">

                <div>

                    <div class="cart-name">
                        ${item.nama}
                    </div>

                    <div class="cart-price">
                        ${rupiah(item.harga)}
                    </div>

                </div>

            </div>

            <div class="qty">

                <button onclick="kurangQty(${item.id})">-</button>

                <b>${item.qty}</b>

                <button onclick="tambahQty(${item.id})">+</button>

            </div>

        </div>

        `;

    });

    document.getElementById("totalBayar").innerHTML=rupiah(total);

}

//=========================
// TAMBAH QTY
//=========================

function tambahQty(id){

    const item=cart.find(c=>c.id===id);

    const barang=products.find(p=>p.id===id);

    if(item.qty >= barang.stok){

        alert("Stok habis.");

        return;

    }

    item.qty++;

    renderCart();

}

//=========================
// KURANG QTY
//=========================

function kurangQty(id){

    const item=cart.find(c=>c.id===id);

    item.qty--;

    if(item.qty<=0){

        cart=cart.filter(c=>c.id!==id);

    }

    renderCart();

}

//=========================
// HITUNG KEMBALIAN
//=========================

document
.getElementById("uangBayar")
.onkeyup=function(){

    let total=0;

    cart.forEach(item=>{

        total+=item.harga*item.qty;

    });

    const bayar=Number(this.value);

    if(bayar<total){

        document.getElementById("kembalian")
        .innerHTML=rupiah(0);

        return;

    }

    document.getElementById("kembalian")
    .innerHTML=
    rupiah(bayar-total);

};

//=========================
// BAYAR
//=========================

document
.getElementById("btnBayar")
.onclick=function(){

    if(cart.length===0){

        alert("Keranjang kosong.");

        return;

    }

    let total=0;
    let modalTotal=0;

    cart.forEach(item=>{

        total += item.harga*item.qty;

        modalTotal += item.modal*item.qty;

    });

    const bayar=Number(
        document.getElementById("uangBayar").value
    );

    if(bayar<total){

        alert("Uang pembeli kurang.");

        return;

    }

    cart.forEach(item=>{

        const barang=products.find(
            p=>p.id===item.id
        );

        barang.stok -= item.qty;

    });

    transaksi.push({

        id:Date.now(),

        tanggal:new Date().toLocaleString("id-ID"),

        items:[...cart],

        total:total,

        modal:modalTotal,

        bayar:bayar,

        kembali:bayar-total

    });

    saveData();

    renderBarang();

    renderLaporan();

    cart=[];

    renderCart();

    document.getElementById("uangBayar").value="";

    alert("Transaksi berhasil.");

};

//=========================
// LOAD
//=========================

renderCart();

/*==========================================
    SATU MART POS
    APP.JS PART 4
==========================================*/

//=========================
// TAMBAH PENGELUARAN
//=========================

document
.getElementById("btnTambahPengeluaran")
.onclick=function(){

    const nama=document
    .getElementById("namaPengeluaran")
    .value
    .trim();

    const nominal=Number(
        document
        .getElementById("jumlahPengeluaran")
        .value
    );

    if(nama=="" || nominal<=0){

        alert("Lengkapi data pengeluaran.");

        return;

    }

    pengeluaran.push({

        id:Date.now(),

        tanggal:new Date().toLocaleDateString("id-ID"),

        nama:nama,

        nominal:nominal

    });

    document.getElementById("namaPengeluaran").value="";
    document.getElementById("jumlahPengeluaran").value="";

    saveData();

    renderPengeluaran();

    renderLaporan();

    updateDashboard();

};

//=========================
// RENDER PENGELUARAN
//=========================

function renderPengeluaran(){

    const tbody=document.getElementById("listPengeluaran");

    tbody.innerHTML="";

    pengeluaran.forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.tanggal}</td>

            <td>${item.nama}</td>

            <td>${rupiah(item.nominal)}</td>

            <td>

                <button
                class="btn-hapus"
                onclick="hapusPengeluaran(${item.id})">

                Hapus

                </button>

            </td>

        </tr>

        `;

    });

}

//=========================
// HAPUS PENGELUARAN
//=========================

function hapusPengeluaran(id){

    if(!confirm("Hapus pengeluaran ini?")) return;

    pengeluaran=pengeluaran.filter(
        p=>p.id!==id
    );

    saveData();

    renderPengeluaran();

    renderLaporan();

    updateDashboard();

}

//=========================
// LAPORAN
//=========================

function renderLaporan(){

    const tbody=document.getElementById("riwayatTransaksi");

    tbody.innerHTML="";

    let totalPenjualan=0;
    let totalModal=0;
    let totalPengeluaran=0;

    transaksi.forEach(item=>{

        totalPenjualan+=item.total;

        totalModal+=item.modal;

        tbody.innerHTML+=`

        <tr>

            <td>${item.tanggal}</td>

            <td>${rupiah(item.total)}</td>

            <td>${rupiah(item.bayar)}</td>

            <td>${rupiah(item.kembali)}</td>

        </tr>

        `;

    });

    pengeluaran.forEach(item=>{

        totalPengeluaran+=item.nominal;

    });

    document.getElementById("lapTotalPenjualan").innerHTML=
    rupiah(totalPenjualan);

    document.getElementById("lapTotalPengeluaran").innerHTML=
    rupiah(totalPengeluaran);

    document.getElementById("lapLaba").innerHTML=
    rupiah(
        totalPenjualan-totalModal-totalPengeluaran
    );

}

//=========================
// RESET DATA
//=========================

function resetSemuaData(){

    if(!confirm("Yakin ingin menghapus seluruh data?")) return;

    products=[];
    transaksi=[];
    pengeluaran=[];
    cart=[];

    localStorage.removeItem("products");
    localStorage.removeItem("transaksi");
    localStorage.removeItem("pengeluaran");

    renderBarang();
    renderCart();
    renderPengeluaran();
    renderLaporan();
    updateDashboard();

    alert("Semua data berhasil dihapus.");

}

//=========================
// LOAD AWAL
//=========================

//=========================
// LOAD AWAL
//=========================

async function init(){

    await loadProducts();

    renderCart();
    renderPengeluaran();
    renderLaporan();
    updateDashboard();

}

init();