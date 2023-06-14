//
// provider block - the code we need to interact with some target cloud//

/* How to authenticate and connect to vSphere API */
provider "vsphere" {
  vsphere_server = var.vsphere_server
  user           = var.vsphere_user
  password       = var.vsphere_password

  // If you have a self-signed cert
  allow_unverified_ssl = true
}



//
// data blocks - get us access to data, we don't actually "deploy" anything here
//

// the datacenter to build in
data "vsphere_datacenter" "dc" {
  name = var.datacenter
}

// the pool of resources to select from (we are not using a cluster, so we are drawing from a single host)
data "vsphere_resource_pool" "pool" {
  name          = "10.0.0.90/Resources"
  datacenter_id = data.vsphere_datacenter.dc.id
}

// disk resources to use (where we read and write to for long term storage)
data "vsphere_datastore" "datastore" {
  name          = var.datastore
  datacenter_id = data.vsphere_datacenter.dc.id
}

// returns the UUID of the network we want to build our VM on
data "vsphere_network" "network" {
  name          = var.network_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

/* Terraform retrieves information about an VM template from the vSphere cluster.
   Terraform will inherit this to configure the virtual machine */
data "vsphere_virtual_machine" "ubuntu" {
  name          = var.ubuntu_name
  datacenter_id = data.vsphere_datacenter.dc.id
}


//
// resource block - this is what we want to have terraform "deploy" for us
//

/* Defines the configuration that Terraform uses to provision the virtual machine.
   Notice how this resource references the previously defined data sources to create a more reusable solution 
   Many of these values are already set within our template
   However, those values may be overridden with our Terraform config */
resource "vsphere_virtual_machine" "learn" {
  name             = var.vm_name                         // this is the name of the virtual machine to be created
  resource_pool_id = data.vsphere_resource_pool.pool.id  // this is hardware set to use
  datastore_id     = data.vsphere_datastore.datastore.id // this is the storage to use for the VM

  // compute resources
  num_cpus = 1    // number of cores - FYI, this is set in the template, but we can override in our config
  memory   = 1024 // in mb (1024mb = 1gb)

  // network resources
  network_interface {
    network_id = data.vsphere_network.network.id
  }

  wait_for_guest_net_timeout = -1
  wait_for_guest_ip_timeout  = -1

  // harddisk resources
  disk {
    label            = "disk0"
    thin_provisioned = false
    size             = 20 // size in gb (template set to 20gb)
  }

  // this is part of the VM setup process (it is already coded into the template)
  // for a list, search "guest_id" on the following URI, and click through to the list of possiblities
  // registry.terraform.io/providers/hashicorp/vsphere/latest/docs/resources/virtual_machine
  guest_id = "ubuntu64Guest"

  // pull from the following template (inherit these settings that we might also overwrite)
  clone {
    template_uuid = data.vsphere_virtual_machine.ubuntu.id
  }
}


//
// output block - this is stuff we want to appear on the screen
//

/* Display the created virtual machine's IP address */
output "vm_ip" {
  value = vsphere_virtual_machine.learn.guest_ip_addresses
}

