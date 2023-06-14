locals {  
    rgs = {
        "alpha" = { "region" ="eastus"
                    "vnet" ="omega" }
        "bravo" = { "region" ="southindia"
                    "vnet" ="psi" }
        "charlie" = {"region" = "westus2"
                    "vnet" ="chi" }
        }
}

resource "null_resource" "dummy_rgs" {
    for_each = local.rgs
    triggers = {
        name = each.key     // alpha, bravo, charlie
        region = each.value.region  // eastus, southindia, westus2
    }
}

resource "null_resource" "dummy_vnets" {
    for_each = local.rgs
    triggers = {
        name = each.value.vnet        // use value of "vnet" above
        region = each.value.region      // use value of "region" above
    }
}


