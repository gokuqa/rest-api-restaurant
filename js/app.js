let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};
const categorias = {
  1: "Comida",
  2: "Bebidas",
  3: "Postres",
};

const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;
  const camposVacios = [mesa, hora].some((campo) => campo === "");
  if (camposVacios) {
    //Verificar si ya hay una alert.
    const existeAlerta = document.querySelector(".invalid-feedback");
    if (!existeAlerta) {
      const alerta = document.createElement("DIV");
      alerta.classList.add("invalid-feedback", "d-block", "text-center");
      alerta.textContent = "Todos los campos son obligatorios";
      document.querySelector(".modal-body form").appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 3000);
      return;
    }
  }

  cliente = { ...cliente, mesa, hora };
  const modalFormulario = document.querySelector("#formulario");

  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  mostrarSecciones();

  //obtener platillos desde la api de Json-server.
  obtenerPlatillos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
  const url = "http://localhost:4000/platillos";

  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => mostrarPlatillos(resultado))
    .catch((error) => console.log(error));
}

function mostrarPlatillos(platillos) {
  const contenido = document.querySelector("#platillos .contenido");
  platillos.forEach((platillo) => {
    const row = document.createElement("DIV");
    row.classList.add("row", "py-3", "border-top");

    const nombre = document.createElement("DIV");
    nombre.classList.add("col-md-4");
    nombre.textContent = platillo.nombre;

    const precio = document.createElement("DIV");
    precio.classList.add("col-md-3,", "fw-bold");
    precio.textContent = `$${platillo.precio}`;

    const categoria = document.createElement("DIV");
    categoria.classList.add("col-md-3,", "fw-bold");
    categoria.textContent = categorias[platillo.categoria];

    const inputCantidad = document.createElement("INPUT");
    inputCantidad.type = "number";
    inputCantidad.min = 0;
    inputCantidad.value = 0;
    inputCantidad.id = `producto-${platillo.id}`;
    inputCantidad.classList.add("form-control");

    //funcion que cuantifica el precio y cantidad de cada platillos
    inputCantidad.onchange = function () {
      const cantidad = parseInt(inputCantidad.value);

      agregarPlatillo({ ...platillo, cantidad });
    };

    const agregar = document.createElement("DIV");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad);

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);
    contenido.appendChild(row);
  });
}


function agregarPlatillo(producto) {
    let { pedido } = cliente;
 
 
    if (producto.cantidad > 0 ) {
         // Comprobar si el platillo ya esta en el carrito...
         if(pedido.some( articulo =>  articulo.id === producto.id )) {
             // Iterar para actualizar la cantidad
             const pedidoActualizado = pedido.map( articulo => {
                 if( articulo.id === producto.id ) {
                     articulo.cantidad = producto.cantidad;
                 } 
                 return articulo;
             });
 
             // Se asigna al array
             cliente.pedido  = [...pedidoActualizado];
         } else {
             // En caso de que el articulo no exista, es nuevo y se agrega
             cliente.pedido = [...pedido, producto];
         }
    } else {
         const resultado = pedido.filter(articulo => articulo.id !== producto.id);
         cliente.pedido = resultado;       
    }
 
    limpiarHTML();

    if (cliente.pedido.length) {
      
      actualizarResumen();
    }else{
      mensajePedidoVacio();
    }
}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");
  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

  const mesa = document.createElement("P");
  mesa.textContent = "Mesa: #";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("SPAN");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  const hora = document.createElement("P");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");
  const horaSpan = document.createElement("SPAN");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  const heading = document.createElement("H3");
  heading.textContent = "Platillos Consumidos";
  heading.classList.add("my-4", "text-center");

  const grupo = document.createElement("UL");
  grupo.classList.add("list-group");
  const { pedido } = cliente;
  
  pedido.forEach(articulo => {
    //Hacemos destructuring al objeto de articulo.
    const { nombre, cantidad, precio, id } = articulo;


    const lista = document.createElement("LI");
    lista.classList.add("list-group-item");
    const nombreEL = document.createElement("H4");
    nombreEL.classList.add("my-4");
    nombreEL.textContent = nombre;

    const cantidadEL = document.createElement("P");
    cantidadEL.classList.add("fw-bold");
    cantidadEL.textContent = 'cantidad: ';

    const cantidadValor = document.createElement('SPAN');
    cantidadValor.classList.add('fw-normal');
    cantidadValor.textContent=cantidad;

    const precioEL = document.createElement("P");
    precioEL.classList.add("fw-bold");
    precioEL.textContent = 'precio: ';

    const precioValor = document.createElement('SPAN');
    precioValor.classList.add('fw-normal');
    precioValor.textContent=`$${precio}`
    
    const subtotalEL = document.createElement("P");
    subtotalEL.classList.add("fw-bold");
    subtotalEL.textContent = 'subtotal: ';

    const subtotalValor = document.createElement('SPAN');
    subtotalValor.classList.add('fw-normal');
  //`subtotal: $`+precio*cantidad;
    subtotalValor.textContent=calcularSubtotal(precio,cantidad);

    const btnEliminar = document.createElement('BUTTON');
    btnEliminar.classList.add('btn', 'btn-danger');
    btnEliminar.textContent='Eliminar del pedido'

    btnEliminar.onclick = function () {
      eliminarProducto(id);
    }

    cantidadEL.appendChild(cantidadValor);
    precioEL.appendChild(precioValor);
    subtotalEL.appendChild(subtotalValor);

    lista.appendChild(nombreEL);
    lista.appendChild(cantidadEL);
    lista.appendChild(precioEL);
    lista.appendChild(subtotalEL);
    lista.appendChild(btnEliminar);

    grupo.appendChild(lista)
  });
  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);
  
  //mostrar formulario de propinas.
  formularioPropinas();

}

function limpiarHTML() {
  const contenido = document.querySelector("#resumen .contenido");

  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

function calcularSubtotal(precio, cantidad) {
    return `$${precio*cantidad}`;
}




function eliminarProducto(id) {
  const {pedido} =cliente;
  const resultado = pedido.filter(articulo => articulo.id !== id);
  cliente.pedido = resultado; 

  limpiarHTML();
  
 if (cliente.pedido.length) {
      
      actualizarResumen();
    }else{
      mensajePedidoVacio();
    }
//producto se elimino por lo tanto regresamos la cantidad a 0 en el formulario.
const productoEliminado = `#producto-${id}`
const inputEliminado = document.querySelector(productoEliminado);
inputEliminado.value = 0;

  }


function mensajePedidoVacio() {
  const contenido = document.querySelector('#resumen .contenido');
  const texto = document.createElement('P');
  texto.classList.add('text-center');
  texto.textContent = 'Añade los elementos del pedido';
  contenido.appendChild(texto);

}




function formularioPropinas() {
  const contenido = document.querySelector('#resumen .contenido');

  const formulario = document.createElement('DIV');
  formulario.classList.add('col-md-6', 'formulario');

  const heading = document.createElement('H3');
  heading.classList.add('my-4', 'text-center');
  heading.textContent='Propina:';

  const divFormulario =document.createElement('DIV');
  divFormulario.classList.add('card', 'py-2','px-3', 'shadow')  


//radio button 10%
const radio10 = document.createElement('INPUT');
  radio10.type= 'radio';
  radio10.name = 'propina';
  radio10.value='10';
  radio10.classList.add('form-check-input');
  radio10.onclick = calcularPropina;

const radio10label = document.createElement('LABEL');
  radio10label.textContent='10%';
  radio10label.classList.add('for-check-label');


const radio10Div =document.createElement('DIV');
  radio10Div.classList.add('form-check');

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10label);


const radio25 = document.createElement('INPUT');
  radio25.type= 'radio';
  radio25.name = 'propina';
  radio25.value='25';
  radio25.classList.add('form-check-input');
  radio25.onclick = calcularPropina;

const radio25label = document.createElement('LABEL');
radio25label.textContent='25%';
radio25label.classList.add('for-check-label');


const radio25Div =document.createElement('DIV');
radio25Div.classList.add('form-check');
radio25Div.appendChild(radio25);
radio25Div.appendChild(radio25label);

//radio de el 50%
const radio50 = document.createElement('INPUT');
  radio50.type= 'radio';
  radio50.name = 'propina';
  radio50.value='50';
  radio50.classList.add('form-check-input');
  radio50.onclick = calcularPropina;

const radio50label = document.createElement('LABEL');
radio50label.textContent='50%';
radio50label.classList.add('for-check-label');


const radio50Div =document.createElement('DIV');
radio50Div.classList.add('form-check');


radio50Div.appendChild(radio50);
radio50Div.appendChild(radio50label);



//agregar al div principal
  divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio25Div);
  divFormulario.appendChild(radio50Div);
//agregar al formulario
  formulario.appendChild(divFormulario);
  contenido.appendChild(formulario)

}

function calcularPropina() {
  const {pedido} = cliente;
  let subtotal = 0;

  pedido.forEach(articulo =>{

    subtotal+= articulo.cantidad * articulo.precio;
  });

  const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;
  
  
  const propina = ((subtotal * parseInt(propinaSeleccionada)) /100);
console.log('propina', propina);
  
  const total= subtotal + propina;
console.log('subtotal', subtotal);

console.log('total', total);

mostrarTotalHTML(subtotal, total, propina);

}

function mostrarTotalHTML(subtotal, total, propina) {
  
  const divTotales = document.createElement('DIV');
  divTotales.classList.add('total-pagar', 'my-5')
  //subtotal.
  const subtotalParrafo = document.createElement('P');
  subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
  subtotalParrafo.textContent= `subtotal Consumo: `;
  

  const subtotalSpan = document.createElement('SPAN');
  subtotalSpan.classList.add( 'fw-normal');
  subtotalSpan.textContent= `$${subtotal}`

  subtotalParrafo.appendChild(subtotalSpan);
  // propina
  const propinaParrafo = document.createElement('P');
  propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
  propinaParrafo.textContent= `propina: `;
  

  const propinaSpan = document.createElement('SPAN');
  propinaSpan.classList.add( 'fw-normal');
  propinaSpan.textContent= `$${propina}`

  propinaParrafo.appendChild(propinaSpan);

  // propina
  const totalParrafo = document.createElement('P');
  totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
  totalParrafo.textContent= `total: `;
  

  const totalSpan = document.createElement('SPAN');
  totalSpan.classList.add( 'fw-normal');
  totalSpan.textContent= `$${total}`

  totalParrafo.appendChild(totalSpan);

//actualizar resultado conforme radio button.

const totalpagarDiv = document.querySelector('.total-pagar')
if (totalpagarDiv) {
  totalpagarDiv.remove();
}

  divTotales.appendChild(subtotalParrafo);
  divTotales.appendChild(propinaParrafo);
  divTotales.appendChild(totalParrafo);

  const formulario = document.querySelector('.formulario > div ');

  formulario.appendChild(divTotales);

}