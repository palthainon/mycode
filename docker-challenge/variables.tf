variable "container_name" {
  description = "Value for the name of container"
  #basic types incldue string, number, bool
  type = string
  default = "AltaResearchWebService"
}

variable "internal_port" {
  description = "Value for the internal port"
  #basic types incldue string, number, bool
  type = number
  default = 9876
}

variable "external_port" {
  description = "Value for the external port"
  #basic types incldue string, number, bool
  type = number
  default = 5432
}

