import dns from 'dns';

// Windows + Node 22+ can fail mongodb+srv SRV lookups (querySrv ECONNREFUSED)
dns.setServers(['1.1.1.1', '8.8.8.8']);

