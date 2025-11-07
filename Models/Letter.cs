using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TempMail.Models;

public class Letter
{
    [Key]
    public int LetterId { get; set; }

    [Required]
    [ForeignKey(nameof(Email))]
    public int MailId { get; set; }

    [Required]
    [MaxLength(256)]
    public string FromAddress { get; set; } = string.Empty;

    [Required]
    public string Body { get; set; } = string.Empty;

    public string? BodyHtml { get; set; }

    [Required]
    public DateTime Time { get; set; } = DateTime.UtcNow;

    public Email Email { get; set; } = null!;
}
