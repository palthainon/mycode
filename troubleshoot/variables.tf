
variable "container_name" {
  description = "Value of the name of the Docker container"
  #basic types include string, number, and boolean
  type = string
  default = "ExampleNginxcontainer"
}

variable "externalport" {
  description = "Value of the external port of the Docker container"
  #basic types include string, number, and bool
  type = number
  default = 2225
}
