import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton as MUIIconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete'; // Importando ícone de exclusão
import api from './api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import theme from './theme';
import logo from './Assets/logo.png';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);

function App() {
  const [reservas, setReservas] = useState([]);
  const [formData, setFormData] = useState({
    hospede: '',
    chale: '',
    dataEntrada: '',
    dataSaida: '',
    valorPago: '',
    valorTotal: '',
    origemReserva: ''
  });
  const [filters, setFilters] = useState({
    chale: '',
    dataEntrada: '',
    dataSaida: ''
  });
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [viewOnly, setViewOnly] = useState(false);
  const chales = ["Itália", "França", "Inglaterra", "África", "Japão", "EUA", "Argentina", "Canadá", "Brasil", "México", "Chile"];
  const origensReserva = ["Booking", "TripAdvisor", "Hotel Hurbano"];

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = () => {
    api.get('/reserve', { params: filters })
      .then(response => {
        setReservas(response.data.data);
      })
      .catch(error => {
        console.error('Erro ao buscar reservas:', error);
      });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReservas();
  };

  const handleFilterClear = () => {
    setFilters({
      chale: '',
      dataEntrada: '',
      dataSaida: ''
    });
    fetchReservas();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStartDate = dayjs(formData.dataEntrada);
    const newEndDate = dayjs(formData.dataSaida);

    const hasConflict = reservas.some(reserva => {
      if (reserva.chale === formData.chale) {
        const reservaStartDate = dayjs(reserva.dataEntrada);
        const reservaEndDate = dayjs(reserva.dataSaida);
        return newStartDate.isBefore(reservaEndDate) && newEndDate.isAfter(reservaStartDate);
      }
      return false;
    });

    if (hasConflict) {
      alert('Conflito de datas: O chalé já está reservado nesse período.');
      return;
    }

    if (selectedReserva) {
      api.put(`/reserve/${selectedReserva.id}`, formData)
        .then(response => {
          setReservas(reservas.map(reserva =>
            reserva.id === selectedReserva.id ? response.data.data : reserva
          ));
          handleCloseModal();
        })
        .catch(error => {
          console.error('Erro ao editar reserva:', error);
          alert('Ocorreu um erro ao editar a reserva. Tente novamente mais tarde.');
        });
    } else {
      api.post('/reserve', formData)
        .then(response => {
          const novaReserva = response.data.data;
          setReservas([...reservas, novaReserva]);
          handleCloseModal();
        })
        .catch(error => {
          console.error('Erro ao adicionar reserva:', error);
          alert('Ocorreu um erro ao adicionar a reserva. Tente novamente mais tarde.');
        });
    }
  };

  const handleEventClick = (info) => {
    const eventoId = info.event.id;
    const reserva = reservas.find(res => res.id.toString() === eventoId);

    if (!reserva) {
      console.error('Reserva não encontrada para o evento com ID:', eventoId);
      return;
    }

    setSelectedReserva(reserva);
    setFormData({
      hospede: reserva.hospede || '',
      chale: reserva.chale || '',
      dataEntrada: reserva.dataEntrada || '',
      dataSaida: reserva.dataSaida || '',
      valorPago: reserva.valorPago || '',
      valorTotal: reserva.valorTotal || '',
      origemReserva: reserva.origemReserva || ''
    });
    setViewOnly(false);
    setOpenModal(true);
  };

  const handleViewClick = (reservaId) => {
    const reserva = reservas.find(res => res.id === reservaId);

    if (!reserva) {
      console.error('Reserva não encontrada para o ID:', reservaId);
      return;
    }

    setSelectedReserva(reserva);
    setFormData({
      hospede: reserva.hospede || '',
      chale: reserva.chale || '',
      dataEntrada: reserva.dataEntrada || '',
      dataSaida: reserva.dataSaida || '',
      valorPago: reserva.valorPago || '',
      valorTotal: reserva.valorTotal || '',
      origemReserva: reserva.origemReserva || ''
    });
    setViewOnly(true);
    setOpenModal(true);
  };

  const handleDeleteClick = (reservaId) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta reserva?');
    if (confirmDelete) {
      api.delete(`/reserve/${reservaId}`)
        .then(() => {
          setReservas(reservas.filter(reserva => reserva.id !== reservaId));
          if (openModal) {
            handleCloseModal();
          }
        })
        .catch(error => {
          console.error('Erro ao excluir reserva:', error);
          alert('Ocorreu um erro ao excluir a reserva. Tente novamente mais tarde.');
        });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReserva(null);
    setFormData({
      hospede: '',
      chale: '',
      dataEntrada: '',
      dataSaida: '',
      valorPago: '',
      valorTotal: '',
      origemReserva: ''
    });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleViewChange = (view) => {
    setView(view);
    setDrawerOpen(false);
  };

  const handleAddReservaClick = () => {
    setSelectedReserva(null);
    setFormData({
      hospede: '',
      chale: '',
      dataEntrada: '',
      dataSaida: '',
      valorPago: '',
      valorTotal: '',
      origemReserva: ''
    });
    setViewOnly(false);
    setOpenModal(true);
  };

  const handleLogoClick = () => {
    if (view === 'list') {
      setView('calendar');
    }
  };

  const filteredReservas = reservas.filter(reserva => {
    const entradaFilter = filters.dataEntrada ? dayjs(reserva.dataEntrada).isSameOrAfter(dayjs(filters.dataEntrada)) : true;
    const saidaFilter = filters.dataSaida ? dayjs(reserva.dataSaida).isSameOrBefore(dayjs(filters.dataSaida)) : true;
    const chaleFilter = filters.chale ? reserva.chale === filters.chale : true;
    return entradaFilter && saidaFilter && chaleFilter;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2} mb={2} bgcolor="background.paper">
          <Box display="flex" alignItems="center" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Logo da Pousada" style={{ width: '150px', height: 'auto', marginRight: '16px' }} />
            <Typography variant="h4"></Typography>
          </Box>
          <Box>
            <IconButton color="inherit" aria-label="add" onClick={handleAddReservaClick}>
              <AddIcon />
            </IconButton>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={3}>
                {view === 'calendar' ? (
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={reservas.map(reserva => ({
                      id: reserva.id.toString(),
                      title: `${reserva.hospede} - ${reserva.chale}`,
                      start: reserva.dataEntrada,
                      end: dayjs(reserva.dataSaida).add(1, 'day').format('YYYY-MM-DD'),
                    }))}
                    locale="pt-br"
                    eventClick={handleEventClick}
                    buttonText={{
                      today: 'Hoje' // Altere o texto do botão "Today"
                    }}
                  />
                ) : (
                  <Paper elevation={3}>
                    <Box p={3}>
                      <Typography variant="h6" gutterBottom>Lista de Reservas</Typography>
                      <List>
                        {filteredReservas.map(reserva => (
                          <ListItem key={reserva.id}>
                            <ListItemText
                              primary={`${reserva.hospede} - ${reserva.chale}`}
                              secondary={`Entrada: ${dayjs(reserva.dataEntrada).format('DD/MM/YYYY')} - Saída: ${dayjs(reserva.dataSaida).format('DD/MM/YYYY')}`}
                            />
                            <MUIIconButton onClick={() => handleViewClick(reserva.id)}> {/* Botão de visualização */}
                              <VisibilityIcon />
                            </MUIIconButton>
                            <MUIIconButton onClick={() => handleEventClick({ event: { id: reserva.id.toString() } })}>
                              <EditIcon />
                            </MUIIconButton>
                            <MUIIconButton onClick={() => handleDeleteClick(reserva.id)}> {/* Botão de exclusão */}
                              <DeleteIcon />
                            </MUIIconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>Filtros</Typography>
                <form onSubmit={handleFilterSubmit}>
                  <TextField
                    fullWidth
                    label="Data de Entrada"
                    type="date"
                    name="dataEntrada"
                    value={filters.dataEntrada}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Data de Saída"
                    type="date"
                    name="dataSaida"
                    value={filters.dataSaida}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="chale-label">Chalé</InputLabel>
                    <Select
                      labelId="chale-label"
                      name="chale"
                      value={filters.chale}
                      onChange={handleFilterChange}
                    >
                      {chales.map(chale => (
                        <MenuItem key={chale} value={chale}>{chale}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button variant="contained" color="primary" type="submit">Aplicar Filtros</Button>
                    <Button variant="outlined" color="secondary" onClick={handleFilterClear}>Limpar Filtros</Button>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{selectedReserva ? (viewOnly ? 'Visualizar Reserva' : 'Editar Reserva') : 'Adicionar Reserva'}</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                fullWidth
                label="Nome do Hóspede"
                name="hospede"
                value={formData.hospede}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  readOnly: viewOnly
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="chale-select-label">Chalé</InputLabel>
                <Select
                  labelId="chale-select-label"
                  name="chale"
                  value={formData.chale}
                  onChange={handleChange}
                  inputProps={{
                    readOnly: viewOnly
                  }}
                >
                  {chales.map((chale) => (
                    <MenuItem key={chale} value={chale}>
                      {chale}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Data de Entrada"
                type="date"
                name="dataEntrada"
                value={formData.dataEntrada}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                InputProps={{
                  readOnly: viewOnly
                }}
              />
              <TextField
                fullWidth
                label="Data de Saída"
                type="date"
                name="dataSaida"
                value={formData.dataSaida}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                InputProps={{
                  readOnly: viewOnly
                }}
              />
              <TextField
                fullWidth
                label="Valor Pago"
                name="valorPago"
                value={formData.valorPago}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  readOnly: viewOnly
                }}
              />
              <TextField
                fullWidth
                label="Valor Total"
                name="valorTotal"
                value={formData.valorTotal}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  readOnly: viewOnly
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="origem-reserva-label">Origem da Reserva</InputLabel>
                <Select
                  labelId="origem-reserva-label"
                  name="origemReserva"
                  value={formData.origemReserva}
                  onChange={handleChange}
                  inputProps={{
                    readOnly: viewOnly
                  }}
                >
                  {origensReserva.map((origem) => (
                    <MenuItem key={origem} value={origem}>
                      {origem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Fechar
            </Button>
            {!viewOnly && (
              <>
                <Button onClick={handleSubmit} color="primary">
                  {selectedReserva ? 'Salvar' : 'Adicionar'}
                </Button>
                {selectedReserva && (
                  <Button onClick={() => handleDeleteClick(selectedReserva.id)} color="secondary">
                    Excluir
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
          <Box width={250}>
            <List>
              <ListItem button onClick={() => handleViewChange('calendar')}>
                <ListItemText primary="Calendário" />
              </ListItem>
              <ListItem button onClick={() => handleViewChange('list')}>
                <ListItemText primary="Lista de Reservas" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Container>
    </ThemeProvider>
  );
}

export default App;
