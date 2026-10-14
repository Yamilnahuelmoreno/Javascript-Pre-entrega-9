const CLAVE_STORAGE = "inventario-productos";
const SEGUNDOS_HASTA_AVISO = 3;
const SEGUNDOS_AVISO_VISIBLE = 7;

class Producto {
    constructor(id, nombre, precio) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
    }
}

const productosPorDefecto = [
    new Producto(1, "Teclado mecánico", 45000),
    new Producto(2, "Mouse inalámbrico", 22000),
    new Producto(3, "Monitor 24''", 180000),
];

function cargarProductosGuardados() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_STORAGE)) ?? productosPorDefecto;
    } catch (error) {
        localStorage.removeItem(CLAVE_STORAGE);
        return productosPorDefecto;
    }
}

let productos = cargarProductosGuardados();

let siguienteId = productos.length
    ? Math.max(...productos.map((p) => p.id)) + 1
    : 1;

const formulario = document.getElementById("form-producto");
const inputNombre = document.getElementById("input-nombre");
const inputPrecio = document.getElementById("input-precio");
const inputBuscar = document.getElementById("input-buscar");
const contenedorItems = document.getElementById("contenedor-items");
const mensajeFeedback = document.getElementById("mensaje-feedback");
const mensajeVacio = document.getElementById("mensaje-vacio");
const contadorItems = document.getElementById("contador-items");
const bannerAviso = document.getElementById("banner-aviso");


function guardarEnStorage() {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(productos));
}

function calcularValorTotal(lista = productos) {
    return lista.reduce((acc, { precio }) => acc + precio, 0);
}

function renderizarProductos(lista = productos) {
    contenedorItems.innerHTML = "";

    lista.forEach((producto) => {
        const { id, nombre, precio } = producto;

        const item = document.createElement("li");
        item.className = "item";
        item.dataset.id = id;

        item.innerHTML = `
            <div class="item__info">
                <h3>${nombre}</h3>
                <p>$${precio.toLocaleString("es-AR")}</p>
            </div>
            <button class="btn-eliminar" data-id="${id}">Eliminar</button>
        `;

        contenedorItems.appendChild(item);
    });

    lista.length === 0
        ? mensajeVacio.classList.add("estado-vacio--visible")
        : mensajeVacio.classList.remove("estado-vacio--visible");

    const cantidad = productos.length;
    contadorItems.textContent = `${cantidad} producto${cantidad === 1 ? "" : "s"} · Valor total: $${calcularValorTotal().toLocaleString("es-AR")}`;
}


function mostrarFeedback(texto, esError = false) {
    mensajeFeedback.textContent = texto;
    esError
        ? mensajeFeedback.classList.add("feedback--error")
        : mensajeFeedback.classList.remove("feedback--error");

    setTimeout(() => {
        mensajeFeedback.textContent = "";
        mensajeFeedback.classList.remove("feedback--error");
    }, 2500);
}

function mostrarAviso(html) {
    bannerAviso.innerHTML = `<div class="banner__contenido">${html}</div>`;
    bannerAviso.classList.add("banner--visible");

    setTimeout(() => {
        bannerAviso.classList.remove("banner--visible");
    }, SEGUNDOS_AVISO_VISIBLE * 1000);
}

setTimeout(() => {
    const cantidad = productos.length;
    const total = calcularValorTotal();

    cantidad === 0
        ? mostrarAviso("🔔 <strong>Recordatorio:</strong> tu inventario está vacío, cargá tu primer producto.")
        : mostrarAviso(`🔔 <strong>Resumen del día:</strong> tenés ${cantidad} producto${cantidad === 1 ? "" : "s"} cargado${cantidad === 1 ? "" : "s"} por un valor total de <strong>$${total.toLocaleString("es-AR")}</strong>.`);
}, SEGUNDOS_HASTA_AVISO * 1000);


formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
        const nombre = inputNombre.value.trim();
        const precio = Number(inputPrecio.value);

        if (!nombre || !(precio > 0)) {
            throw new Error("No se pudo procesar la operación: completá un nombre y un precio válido");
        }

        const nuevoProducto = new Producto(siguienteId, nombre, precio);
        const { id, nombre: nombreAgregado } = nuevoProducto;

        productos.push(nuevoProducto);
        siguienteId++;

        guardarEnStorage();
        renderizarProductos();
        mostrarFeedback(`Se agregó "${nombreAgregado}" al inventario`);
        formulario.reset();

        const itemNuevo = contenedorItems.querySelector(`[data-id="${id}"]`);
        itemNuevo?.classList.add("item--resaltado");
        setTimeout(() => itemNuevo?.classList.remove("item--resaltado"), 900);
    } catch (error) {
        mostrarFeedback(error.message, true);
    } finally {
        
        inputNombre.focus();
    }
});


contenedorItems.addEventListener("click", (event) => {
    if (!event.target.classList.contains("btn-eliminar")) return;

    const id = Number(event.target.dataset.id);
    const producto = productos.find((p) => p.id === id);

    productos = productos.filter((p) => p.id !== id);

    guardarEnStorage();
    renderizarProductos();
    mostrarFeedback(`Se eliminó "${producto?.nombre}" del inventario`);
});


inputBuscar.addEventListener("keyup", (event) => {
    const texto = event.target.value.toLowerCase();
    const filtrados = productos.filter(({ nombre }) =>
        nombre.toLowerCase().includes(texto)
    );
    renderizarProductos(filtrados);
});

renderizarProductos();
