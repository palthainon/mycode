
# produces an output value named "space_heroes"
output "space_heroes" {
  description = "API that documents folks in space"
  value       = data.http.iss.response_body
}

# produces legal JSON output value named "space_heroes_json"
output "space_heroes_json" {
  description = "API that documents folks in space"
  value       = jsondecode(data.http.pokemon.response_body)    // note the jsondecode()
}

# produces an output value named "pokemon"
output "pokemon" {
  description = "API that documents folks in space"
  value       = data.http.iss.response_body
}

# produces legal JSON output value named "pokemon_json"
output "pokemon_json" {
  description = "API that documents folks in space"
  value       = jsondecode(data.http.pokemon.response_body)    // note the jsondecode()
}
                                          
