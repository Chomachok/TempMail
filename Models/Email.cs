using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;

namespace TempMail.Models;

public class Email
{
    [Key]
    public int EmailId { get; set; }

    [Required]
    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    [Required]
    [MaxLength(128)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime DiesAt { get; set; } 

    [Required]
    public bool Alive { get; set; } = true;

    public User User { get; set; } = null!;
    public List<Letter> Letters { get; set; } = new();

    public void SetDeathTime(int minutes = 10)
    {
        DiesAt = CreatedAt.AddMinutes(minutes);
    }
}
