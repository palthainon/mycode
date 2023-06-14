/* Alta3 Research - rzfeeser@alta3.com
Working with "for_each" within a null_resource */

/* Terraform block */
terraform {
    required_providers {
      docker = {
        source  = "kreuzwerker/docker"
        version = "~> 2.22.0"
      }
    }
  }
provider "docker" {}
resource "docker_image" "simplegoservice" {
    name         = "registry.gitlab.com/alta3/simplegoservice"
    keep_locally = true       // keep image after "destroy"
  }
  
  /* a list of local variables */
locals {
    vm = {
        vm1 = { image_id = docker_image.simplegoservice.image_id, extport = 8001 } 
        vm2 = { image_id = docker_image.simplegoservice.image_id, extport = 8002 }
        vm3 = { image_id = docker_image.simplegoservice.image_id, extport = 8030 }
    }
  }
  
resource "docker_container" "vm" {
    for_each = local.vm
    name = each.key
    image = each.value.image_id
    ports {
            external = each.value.extport
            internal = 80
      }
}
