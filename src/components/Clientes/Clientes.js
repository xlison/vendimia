import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import { withSnackbar } from 'notistack';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import EditButton from '@material-ui/icons/Edit';
import AddButton from '@material-ui/icons/Add';
import MaterialTable from 'material-table'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';


const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%',
  },
  hide: {
    display: 'none',
  },
  button: {
    margin: theme.spacing.unit,
  },
  addButton: {
    float: 'right',
    background: '#4caf50'
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end"
  },
  root: {
    flexGrow: 1,
  },
  folio:{
        float: 'right',
    fontSize: '16px'
  }
});
const defaultData = {id_cliente: 0, nombre: "", paterno: "", materno: "", rfc: ""};

const defaultErrors = {
      nombre: true,
      paterno: true,
      rfc: true,
    };

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}



class Clientes extends React.Component {
  
  state = {
    error: null,
    isLoaded: false,
    items: [],
    open: false,
    modalData: JSON.parse(JSON.stringify(defaultData)),
    errors: defaultErrors,
    modalProcess: false,
    modalNextID: '0000',
    modalInitialState: true
  };

  handleClickOpen = (paramData = {}) => {
  console.log(paramData, (typeof paramData));
    if (paramData && typeof paramData.id_cliente != "undefined"){
      this.setState({ open: true, modalData: paramData});
    }else{
      this.setState({ open: true});
    }
    
  };

  handleClose = () => {
    this.setState({ open: false, modalData: JSON.parse(JSON.stringify(defaultData)), errors: defaultErrors, modalInitialState: true });
  };

   handleCancel = () => {
    window.location.href= "/"
  };

  handleSubmit = event => {
    event.preventDefault();

    const errors = this.state.errors;
    const modalData = this.state.modalData;

    for (var k in errors){
      errors[k] = (modalData[k].length == 0);
      if (errors.hasOwnProperty(k) && errors[k]) {
        this.props.enqueueSnackbar('No es posible continuar, debe ingresar ' + k + ' es obligatorio');
        this.setState({
          errors: errors,
          modalInitialState: false
        });
        return false;
      }
  }
    const params = this.state.modalData;
    const items = this.state.items;

    this.setState({ modalProcess: true });

    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: JSON.stringify(params),
      url: 'http://localhost/vendimia/api/setClientes'
    };

    axios(options).then(res => {
      //console.log(res);
      if (res.data.success){
        if (params.id_cliente == 0){
          params.id_cliente = res.data.id_cliente;
          items.push(params);
        }else{
          items[params.tableData.id] = params;
        }

        this.setState({ modalProcess: false, open: false, items: items, modalData: JSON.parse(JSON.stringify(defaultData)), errors: defaultErrors, modalInitialState: true, modalNextID: pad(res.data.nextID, 4) });
        
        this.props.enqueueSnackbar('Bien Hecho. El cliente ha sido registrado correctamente.');

      }else{
        this.setState({ modalProcess: false});
        this.props.enqueueSnackbar(res.data.message);
      }

        
      });
  }

  

  componentDidMount() {
    fetch("http://localhost/vendimia/api/getClientes")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.data,
            modalNextID: pad(result.nextID, 4)
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

   handleChange = (e) => {
    const modalData = this.state.modalData;
    const errors = this.state.errors;
    modalData[e.target.name] = e.target.value;
    if (e.target.required){
      errors[e.target.name] = (e.target.value.length == 0);
    }
    this.setState({
      modalData: modalData,
      errors: errors,
      modalInitialState: false
    });
  };


  render() {
    const { classes } = this.props;

     const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Cargando Tabla...</div>;
    } else {
      return (
      <React.Fragment>
        <Fab
          variant="extended"
          size="medium"
          color="primary"
          aria-label="Agregar"
          className={classNames(classes.addButton,classes.margin)} 
          onClick={this.handleClickOpen}
        >
          <AddButton className={classes.extendedIcon} />
          Nuevo Cliente
        </Fab>
        <br/><br/><br/>
        <MaterialTable
          title="Registro de Clientes"
          columns={[
            { title: 'Clave Cliente', field: 'id_cliente',
              render: rowData => {
                return (
                  <div style={{ width: '100%'}}>
                    {pad(rowData.id_cliente, 4)}
                  </div>
                )
              },
            },
            { title: 'Nombre', field: 'nombre' },
            { title: 'Paterno', field: 'paterno' },
            { title: 'Materno', field: 'materno' },
            { title: 'RFC', field: 'rfc' },
            { title: 'Editar',
              render: rowData => {
                return (
                  <div style={{ width: '100%'}}>
                    <IconButton aria-label="Editar" className={classes.margin} onClick={(e) => {this.handleClickOpen(JSON.parse(JSON.stringify(rowData)))}}>
                      <EditButton fontSize="small" />
                    </IconButton>
                  </div>
                )
              },
            },
          ]}
          data={this.state.items}
        />

        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <div className={classNames(classes.root, !this.state.modalProcess && classes.hide)}>
            <LinearProgress variant="query" />
          </div>
          <DialogTitle id="form-dialog-title">Registro de Clientes <span className={classes.folio}>Folio: {this.state.modalNextID}</span></DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="modalNombre"
              name="nombre"
              label="Nombre"
              type="text"
              value={this.state.modalData.nombre}
              error={(!this.state.modalInitialState && this.state.errors.nombre)}
              onChange={this.handleChange}
              required
              fullWidth
            />
            <TextField
              margin="dense"
              id="modalPaterno"
              name="paterno"
              label="Apellido Paterno"
              type="text"
              value={this.state.modalData.paterno}
              error={(!this.state.modalInitialState && this.state.errors.paterno)}
              onChange={this.handleChange}
              required
              fullWidth
            />
            <TextField
              margin="dense"
              id="modalMaterno"
              name="materno"
              label="Apellido Materno"
              type="text"
              value={this.state.modalData.materno}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              id="modalRFC"
              name="rfc"
              label="RFC"
              type="text"
              required
              value={this.state.modalData.rfc}
              error={(!this.state.modalInitialState && this.state.errors.rfc)}
              onChange={this.handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancelar
            </Button>
            <Button onClick={this.handleSubmit} color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
    </React.Fragment>
    );
  	}
  }
}

export default withStyles(styles)(
    withSnackbar(Clientes),
);